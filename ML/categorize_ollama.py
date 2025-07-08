# categorize_local_or_cloud.py

import json
import os
from tqdm import tqdm

USE_OLLAMA = True  # 🔁 switch this to False to use OpenAI GPT

if USE_OLLAMA:
    import ollama
else:
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")

CATEGORY_PROMPT = """
You are a Transaction Categorization Engine.

Your job is to:
1. Parse each transaction from the list.
2. Assign one of the following categories:
   - Groceries, Fuel, Shopping, E-commerce, Food & Dining, Bills & Recharges,
     Cash/ATM, Transfers, UPI Received, Services & Subscriptions, Others

Group the output as:
{
  "Groceries": [...],
  "Fuel": [...],
  ...
}

Here is the transaction list:
{data}
Return only the JSON output.
"""

def load_transactions(path):
    with open(path) as f:
        data = json.load(f)
    return data.get("Transactions", data)

def chunk_transactions(txns, chunk_size=15):
    for i in range(0, len(txns), chunk_size):
        yield txns[i:i + chunk_size]

def call_openai(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an intelligent transaction classifier."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )
    return response['choices'][0]['message']['content']

def call_ollama(prompt):
    response = ollama.chat(model='llama3.2:1B', messages=[
        {"role": "system", "content": "You are an intelligent transaction classifier."},
        {"role": "user", "content": prompt}
    ])
    return response['message']['content']

def categorize_transactions(input_path, output_path):
    txns = load_transactions(input_path)
    final_result = {}

    for chunk in tqdm(list(chunk_transactions(txns))):
        prompt = CATEGORY_PROMPT.replace("{data}", json.dumps(chunk, indent=2))

        try:
            response = call_ollama(prompt) if USE_OLLAMA else call_openai(prompt)
            chunk_json = json.loads(response)
            for cat, items in chunk_json.items():
                final_result.setdefault(cat, []).extend(items)

        except Exception as e:
            print("❌ Error during categorization:", str(e))

    with open(output_path, "w") as f:
        json.dump(final_result, f, indent=2)

    print(f"[✔] Categorized output saved → {output_path}")

if __name__ == "__main__":
    categorize_transactions("output_final.json", "output_categorized.json")
