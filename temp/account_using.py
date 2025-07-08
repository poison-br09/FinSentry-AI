import pdfplumber
import re
import json


def extract_account_details(text):
    def safe_extract(pattern, label):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else f"{label} not found"

    return {
        "Account Name": safe_extract(r"Account Name\s*:\s*(.+)", "Account Name"),
        "Account Number": safe_extract(r"Account Number\s*:\s*(\d+)", "Account Number"),
        "IFSC Code": safe_extract(r"IFS Code\s*:\s*([A-Z0-9]+)", "IFSC Code"),
    }


def clean_amount(val):
    try:
        return float(val.replace(",", "").strip()) if val else None
    except:
        return None

def extract_transactions_using_table(pdf_path):
    transactions = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    # Skip headers or malformed rows
                    if (
                        not row
                        or len(row) < 6
                        or not re.match(r"\d{1,2} \w{3} \d{4}", row[0])
                    ):
                        continue

                    txn = {
                        "Value Date": row[1].strip(),
                        "Description": (
                            row[2].replace("\n", "").strip() if row[2] else ""
                        ),
                        "Debit": clean_amount(row[3]),
                        "Credit": clean_amount(row[4]),
                        "Balance": clean_amount(row[5]),
                    }

                    transactions.append(txn)
    return transactions


def parse_pdf_to_json_fixed(pdf_path, output_path=None):
    with pdfplumber.open(pdf_path) as pdf:
        full_text = "\n".join(
            page.extract_text() for page in pdf.pages if page.extract_text()
        )

    account_info = extract_account_details(full_text)
    account_info["Transactions"] = extract_transactions_using_table(pdf_path)

    if output_path:
        with open(output_path, "w") as f:
            json.dump(account_info, f, indent=2)

    return account_info


# Example usage
if __name__ == "__main__":
    result = parse_pdf_to_json_fixed("abhay_original.pdf", "output_final.json")
    # print(json.dumps(result, indent=2))
    print("Done! Check output_final.json for results.")
