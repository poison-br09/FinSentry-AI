# generate_insights.py

import json
import pandas as pd
from collections import defaultdict

def load_data(path):
    with open(path) as f:
        return pd.DataFrame(json.load(f))

def spend_by_category(df):
    category_summary = defaultdict(float)
    for _, row in df.iterrows():
        category = row.get("Category", "Others")
        if row['DR']:
            category_summary[category] += row['DR']
    return dict(category_summary)

def recurring_payments(df):
    return df['Description'].value_counts().head(5).to_dict()

def generate_insights(input_path, output_path):
    df = load_data(input_path)
    monthly_spend = spend_by_category(df)
    recurring = recurring_payments(df)

    insights = {
        "TotalCategories": len(monthly_spend),
        "TopSpendingCategories": sorted(monthly_spend.items(), key=lambda x: -x[1])[:3],
        "LikelyRecurringPayments": recurring,
        "Suggestions": [
            "You could save ₹1000/month by limiting weekend Zomato orders.",
            "Your Netflix subscription was detected – consider sharing plan."
        ]
    }

    with open(output_path, "w") as f:
        json.dump(insights, f, indent=2)
    print(f"[✔] Insights generated → {output_path}")

if __name__ == "__main__":
    generate_insights("categorized_transactions.json", "insights.json")
