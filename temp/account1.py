import pdfplumber
import re
import json

# Clean text artifacts and normalize spacing
def clean_pdf_text(text):
    text = re.sub(r'\(cid:\d+\)', '', text)
    text = re.sub(r'\(cid:\w+\)', '', text)
    text = text.replace('\t', ' ')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# Extract account details using fallback-safe regex
def extract_account_details(text):
    def safe_extract(pattern, label):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else f"{label} not found"

    acct_match = re.search(r'Account Number\s*[:\-]?\s*(\d{10,20})', text, re.IGNORECASE)
    acct_number = acct_match.group(1) if acct_match else "Account Number not found"

    return {
        "Account Name": safe_extract(r'Account Name\s*[:\-]?\s*(.+)', "Account Name"),
        "Account Number": acct_number,
        "IFSC Code": safe_extract(r'IFS Code\s*[:\-]?\s*([A-Z0-9]+)', "IFSC Code")
    }

# Convert string amount to float safely
def clean_amount(val):
    try:
        return float(val.replace(',', '').strip()) if val else None
    except:
        return None

# Parse the entire transaction section line-by-line
def extract_transactions(text):
    lines = text.splitlines()
    cleaned_lines = []
    date_found = False

    for line in lines:
        line = line.strip()
        if not date_found and re.fullmatch(r'\d{1,2} \w{3} 202\d', line):
            date_found = True
        if date_found and line:
            cleaned_lines.append(line)

    transactions = []
    current_block = []

    for line in cleaned_lines:
        if re.fullmatch(r'\d{1,2} \w{3} 202\d', line):
            if current_block:
                txn = parse_transaction_block(current_block)
                if txn:
                    transactions.append(txn)
                current_block = []
        current_block.append(line)

    if current_block:
        txn = parse_transaction_block(current_block)
        if txn:
            transactions.append(txn)

    return transactions

# Parse one transaction block
def parse_transaction_block(lines):
    if len(lines) < 2:
        return None

    txn = {}

    # Extract Value Date
    date_match = re.search(r'\d{1,2} \w{3} 202\d', lines[0])
    txn['Value Date'] = date_match.group(0) if date_match else "Unknown"

    # Extract Description
    desc_lines = []
    for line in lines[1:]:
        if re.search(r'\d+\.\d{2}', line):  # probably amount line
            break
        cleaned = re.sub(r'\(cid:\d+\)', '', line).strip()
        desc_lines.append(cleaned)

    description = " ".join(desc_lines)
    description = re.sub(r'\s{2,}', ' ', description)
    txn['Description'] = description.strip(" :-")

    # Extract Amounts
    joined = " ".join(lines)
    amounts = re.findall(r'\d{1,3}(?:,\d{3})*\.\d{2}', joined)
    cleaned_amounts = [clean_amount(a) for a in amounts]

    # txn['Balance'] = cleaned_amounts[-1] if len(cleaned_amounts) >= 1 else None
    # Attempt to extract balance from specific line if labeled
    balance_match = None
    for line in reversed(lines):
        if "balance" in line.lower():
            match = re.search(r'\d{1,3}(?:,\d{3})*\.\d{2}', line)
            if match:
                balance_match = clean_amount(match.group(0))
                break

    # Fallback to last amount only if no "balance" line found
    txn['Balance'] = balance_match if balance_match is not None else (
        cleaned_amounts[-1] if cleaned_amounts else None
    )


    is_credit = any(term in txn['Description'].upper() for term in [
        "CREDIT", "CR/", "TRANSFER FROM", "BY TRANSFER", "TO A/C", "RECEIVED"
    ])

    if is_credit:
        txn['Credit'] = cleaned_amounts[0] if cleaned_amounts else None
        txn['Debit'] = None
    else:
        txn['Debit'] = cleaned_amounts[0] if cleaned_amounts else None
        txn['Credit'] = None

    return txn

# Main wrapper
def parse_pdf_to_json(pdf_path, output_json_path=None):
    with pdfplumber.open(pdf_path) as pdf:
        raw_text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

    cleaned_text = clean_pdf_text(raw_text)

    result = extract_account_details(cleaned_text)
    result["Transactions"] = extract_transactions(cleaned_text)

    # Filter out incomplete transactions
    result["Transactions"] = [
        txn for txn in result["Transactions"]
        if txn.get("Value Date") and txn.get("Description")
           and (txn.get("Debit") is not None or txn.get("Credit") is not None)
    ]

    if output_json_path:
        with open(output_json_path, 'w') as f:
            json.dump(result, f, indent=2)

    return result

# Run it
if __name__ == "__main__":
    result = parse_pdf_to_json("abhay_original.pdf", "output_statement_clean_1.json")
    print(json.dumps(result, indent=2))
