import pandas as pd
import spacy
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import ollama

# Load SpaCy NER model
nlp = spacy.load("en_core_web_sm")

# Configuration
OLLAMA_MODEL = "llama3"
CATEGORIES = [
    "groceries", "fuel", "travel", "subscriptions", "dining", "health",
    "utilities", "shopping", "others"
]
ALERT_THRESHOLD = 10000  # ₹10,000


def query_ollama(prompt: str) -> str:
    """Query local Ollama LLM and return the category"""
    response = ollama.chat(
        model=OLLAMA_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    return response['message']['content'].strip()


def classify_transaction(description: str, amount: float) -> str:
    """Generate LLM prompt for classification"""
    prompt = f"""
You are a financial assistant. Categorize the following bank transaction into one of the following categories:
{CATEGORIES}

If the transaction doesn’t clearly fit any category, return "others".

Transaction: "{description}"
Amount: ₹{amount}

Only return the category name.
"""
    return query_ollama(prompt)


def standardize_merchants(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize merchant names using TF-IDF similarity"""
    merchants = df["Description"].astype(str).unique().tolist()
    vectorizer = TfidfVectorizer().fit(merchants)
    merchant_vectors = vectorizer.transform(merchants)

    def closest_match(name):
        query_vec = vectorizer.transform([name])
        sims = cosine_similarity(query_vec, merchant_vectors).flatten()
        best_idx = sims.argmax()
        return merchants[best_idx] if sims[best_idx] > 0.7 else name

    df["Standard_Merchant"] = df["Description"].astype(str).apply(closest_match)
    return df


def detect_recurring_ner(description: str) -> bool:
    """Use NER to detect recurring keywords and date patterns"""
    doc = nlp(description)
    keywords = ["monthly", "subscription", "recurring", "every month", "auto-debit"]
    return any(ent.label_ in ["DATE", "TIME"] for ent in doc.ents) and any(k in description.lower() for k in keywords)


def process_finsentry_json(input_json: dict) -> dict:
    """Main ML pipeline logic: categorizes and flags transactions"""
    account_number = input_json.get("Account Number", "UNKNOWN")
    transactions = input_json.get("Transactions", [])

    # Load into DataFrame
    df = pd.DataFrame(transactions)
    df.fillna('', inplace=True)

    # Filter only expenses (debits)
    df = df[df["Debit"].astype(str) != ""]
    df["Amount"] = df["Debit"].astype(float)

    # Standardize merchants from description
    df = standardize_merchants(df)
    df["Text"] = df["Standard_Merchant"] + " " + df["Description"]

    categorized_summary = defaultdict(list)
    alerts = []

    # Process each transaction
    for _, row in df.iterrows():
        merchant = row["Standard_Merchant"]
        description = row["Description"]
        amount = float(row["Amount"])
        text = row["Text"]

        # Category prediction
        category = classify_transaction(text, amount)
        flags = []

        # Flagging
        if amount > ALERT_THRESHOLD:
            alerts.append(f"High-value transaction at '{merchant}' – ₹{amount}")
            flags.append("HIGH_VALUE")

        if category == "others":
            alerts.append(f"Unclear category for transaction: '{text}'")
            flags.append("UNCLEAR_CATEGORY")

        if detect_recurring_ner(description):
            alerts.append(f"Recurring transaction detected: '{text}'")
            flags.append("RECURRING")

        # Append to category
        categorized_summary[category].append({
            "merchant": merchant,
            "amount": amount,
            "flags": flags
        })

    return {
        "account_number": account_number,
        "categorized_summary": categorized_summary,
        "alerts": alerts
    }

