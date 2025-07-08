# categorize_gpt.py

import json
import openai
import os
from tqdm import tqdm

# Load your OpenAI API Key securely
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

def load_transactions(json_path):
    with open(json_path, "r") as f:
        data = json.load(f)
    return data.get("Transactions", data)  # fallback if wrapped in account info

def chunk_transactions(transactions, chunk_size=20):
    for i in range(0, len(transactions), chunk_size):
        yield transactions[i:i + chunk_size]

def call_gpt(messages):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages,
        temperature=0.2
    )
    return response['choices'][0]['message']['content']

def categorize_transactions(input_path, output_path):
    txns = load_transactions(input_path)
    final_grouped = {}

    for chunk in tqdm(list(chunk_transactions(txns))):
        user_prompt = CATEGORY_PROMPT.replace("{data}", json.dumps(chunk, indent=2))

        try:
            reply = call_gpt([
                {"role": "system", "content": "You are an intelligent transaction classifier."},
                {"role": "user", "content": user_prompt}
            ])

            chunk_result = json.loads(reply)
            # Merge into final result
            for cat, items in chunk_result.items():
                final_grouped.setdefault(cat, []).extend(items)

        except Exception as e:
            print("❌ GPT error:", str(e))

    with open(output_path, "w") as f:
        json.dump(final_grouped, f, indent=2)
    print(f"[✔] Categorized output saved → {output_path}")

if __name__ == "__main__":
    categorize_transactions("input_data_for_llm.json", "output_categorized_from_llm.json")
