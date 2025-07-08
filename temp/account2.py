import json
import re


def clean_description(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r"\s{2,}", " ", text)
    text = text.replace("Pay t", "Paytm")  # sample fix
    return text.strip(" :-")


def refactor_json(input_file, output_file):
    with open(input_file, "r") as f:
        data = json.load(f)

    refactored = {
        "Account Number": data.get("Account Number", "").strip(),
        "Account Name": data.get("Account Name", "").strip(),
        "IFSC Code": data.get("IFSC Code", "").strip(),
        "Transactions": [],
    }

    for txn in data.get("Transactions", []):
        cleaned_txn = {
            "Value Date": (txn.get("Value Date") or "").strip(),
            "Description": clean_description(txn.get("Description")),
            "Debit": txn.get("Debit"),
            "Credit": txn.get("Credit"),
            "Balance": txn.get("Balance"),
        }

        refactored["Transactions"].append(cleaned_txn)

    with open(output_file, "w") as f:
        json.dump(refactored, f, indent=2)

    print(f"✅ Refactored JSON written to: {output_file}")


if __name__ == "__main__":
    refactor_json("output_statement_clean.json", "refactored_statement.json")
