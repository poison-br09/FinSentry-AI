import re
import json
import pandas as pd
import spacy
import ollama
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load SpaCy model
nlp = spacy.load("en_core_web_sm")

# Constants
OLLAMA_MODEL = "llama3"
CATEGORIES = [
    "groceries", "fuel", "travel", "subscriptions", "dining", "health",
    "utilities", "shopping", "others"
]
ALERT_THRESHOLD = 10000


def query_ollama(prompt: str) -> str:
    response = ollama.chat(
        model=OLLAMA_MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    raw = response['message']['content'].strip().lower()
    for cat in CATEGORIES:
        if cat in raw:
            return cat
    return "others"


def classify_transaction(description: str, amount: float) -> str:
    prompt = f"""
You are a financial assistant. Categorize the following bank transaction into one of the following categories:
{CATEGORIES}

If the transaction doesn’t clearly fit any category, return "others".

Transaction: "{description}"
Amount: ₹{amount}

Only return the category name.
"""
    return query_ollama(prompt)


def extract_merchant_from_description(desc: str) -> str:
    parts = re.split(r'[\/\-]', desc.lower())
    known = [
        "swiggy", "zomato", "amazon", "flipkart", "bharatpe", "paytm",
        "phonepe", "airtel", "vodafone", "netflix", "prime", "tatasky",
        "vi", "ola", "uber", "irctc"
    ]
    for part in parts:
        if any(k in part for k in known):
            return part
    doc = nlp(desc)
    for ent in doc.ents:
        if ent.label_ in ["PERSON", "ORG"]:
            return ent.text.lower()
    return "unknown"


def standardize_merchants(df: pd.DataFrame) -> pd.DataFrame:
    raw_merchants = df["Description"].astype(str).apply(extract_merchant_from_description)
    unique = raw_merchants.unique().tolist()
    if len(unique) == 0:
        df["Standard_Merchant"] = "unknown"
        return df

    vectorizer = TfidfVectorizer().fit(unique)
    merchant_vectors = vectorizer.transform(unique)

    def closest_match(name):
        if not name.strip():
            return "unknown"
        query_vec = vectorizer.transform([name])
        sims = cosine_similarity(query_vec, merchant_vectors).flatten()
        best_idx = sims.argmax()
        return unique[best_idx] if sims[best_idx] > 0.7 else name

    df["Standard_Merchant"] = raw_merchants.apply(closest_match)
    return df


def detect_recurring(description: str) -> bool:
    doc = nlp(description)
    keywords = ["monthly", "subscription", "recurring", "every month", "auto-debit"]
    return any(ent.label_ in ["DATE", "TIME"] for ent in doc.ents) and any(k in description.lower() for k in keywords)


def process_finsentry_json(input_json: dict) -> dict:
    account_number = input_json.get("Account Number", "UNKNOWN")
    transactions = input_json.get("Transactions", [])
    df = pd.DataFrame(transactions)

    df["Debit"] = pd.to_numeric(df["Debit"], errors="coerce")
    df = df[df["Debit"].notna()]
    df["Amount"] = df["Debit"].astype(float)
    df["Description"] = df["Description"].fillna("")

    df = standardize_merchants(df)
    df["Text"] = "UPI transaction to " + df["Standard_Merchant"]

    categorized_summary = defaultdict(list)
    alerts = []

    for _, row in df.iterrows():
        merchant = row["Standard_Merchant"]
        description = row["Description"]
        amount = row["Amount"]
        prompt_text = row["Text"]

        category = classify_transaction(prompt_text, amount)
        flags = []

        if amount > ALERT_THRESHOLD:
            flags.append("HIGH_VALUE")
            alerts.append(f"High-value transaction at '{merchant}' – ₹{amount}")

        if category == "others":
            flags.append("UNCLEAR_CATEGORY")
            alerts.append(f"Unclear category for transaction: '{prompt_text}'")

        if detect_recurring(description):
            flags.append("RECURRING")
            alerts.append(f"Recurring transaction detected: '{prompt_text}'")

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


def run_test_from_file(input_file_path: str, output_file_path: str):
    with open(input_file_path, "r") as f:
        input_data = json.load(f)

    result = process_finsentry_json(input_data)

    with open(output_file_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"✅ ML output written to: {output_file_path}")
    return output_file_path

run_test_from_file("input.json", "output.json")