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
        val = val.replace(",", "").strip()
        return float(val) if val else 0.0
    except:
        return 0.0

def extract_transactions_using_table(pdf_path):
    import re

    def normalize_date(date_str):
        # Converts "22 Dec\n2024" → "22 Dec 2024"
        return re.sub(r"\s+", " ", date_str.strip())

    transactions = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    # Skip obvious headers
                    if row and "Txn Date" in row[0]:
                        # print(row)
                        continue
            
                    # Normalize row length by padding to 7 columns
                    row = row + [""] * (7 - len(row))
                
                    try:
                        date_raw = normalize_date(row[0])
                        # Relaxed regex to allow dates like "1 Jan 2025"
                        if not re.match(r"\d{1,2} \w{3,9} \d{4}", date_raw):
                            continue

                        txn = {
                            "Date": date_raw,
                            # "Value Date": normalize_date(row[1]) if len(row) > 1 else "",
                            "Description": re.sub(r"\s+", "", row[2]) if len(row) > 2 else "",
                            # "Ref No.": row[3].replace("\n", " ").strip() if len(row) > 3 else "",
                            "Debit": clean_amount(row[4]) if len(row) > 4 else None,
                            "Credit": clean_amount(row[5]) if len(row) > 5 else None,
                            "Balance": clean_amount(row[6]) if len(row) > 6 else None
                        }

                        transactions.append(txn)
                    except Exception as e:
                        print("⚠️ Parse error on row:", row, "→", str(e))

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
    result = parse_pdf_to_json_fixed("abhay_original.pdf", "input_data_for_llm.json")
    # print(json.dumps(result, indent=2))
    print("Done! Check input_data_for_llm.json for results.")
