import pdfplumber
import re
import json

# def extract_statement_info(text):
#     data = {}
#     # Extract account-level fields
#     data['Account Name'] = re.search(r'Account Name\s*:\s*(.+)', text).group(1).strip()
#     data['Account Number'] = re.search(r'Account Number\s*:\s*(\d+)', text).group(1).strip()
#     data['IFSC Code'] = re.search(r'IFS Code\s*:\s*([A-Z0-9]+)', text).group(1).strip()
#     return data

def extract_statement_info(text):
    data = {}

    # Helper function for safe extraction
    def extract_field(pattern, label):
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1).strip() if match else f"{label} not found"

    data['Account Name'] = extract_field(r'Account Name\s*:\s*(.+)', "Account Name")
    data['Account Number'] = extract_field(r'Account Number\s*:\s*(\d{5,})', "Account Number")
    data['IFSC Code'] = extract_field(r'IFS Code\s*:\s*([A-Z0-9]+)', "IFSC Code")

    return data


def extract_transactions(text):
    lines = text.split('\n')
    transactions = []
    current = {}
    
    for i in range(len(lines)):
        line = lines[i].strip()

        # Match transaction line that has a date, e.g., 22 Dec 2024
        date_match = re.match(r'(\d{1,2} \w{3} 202\d)', line)
        if date_match:
            if current:  # save previous
                transactions.append(current)
                current = {}

            current['Value Date'] = date_match.group(1)
            # Next line might be same date again
            if i+1 < len(lines) and re.match(r'\d{1,2} \w{3} 202\d', lines[i+1].strip()):
                i += 1

            # Now, Description likely begins on next line
            # desc = []
            # j = i + 1
            # while j < len(lines) and not re.match(r'\d{1,2} \w{3} 202\d', lines[j]):
            #     if re.search(r'\d+\.\d{2}', lines[j]):  # stop at debit/credit line
            #         break
            #     desc.append(lines[j].strip())
            #     j += 1
            # current['Description'] = ' '.join(desc)

            desc = []
            j = i + 1
            while j < len(lines):
                next_line = lines[j].strip()
                if re.match(r'\d{1,2} \w{3} 202\d', next_line):
                    break
                if re.search(r'\d{12}', next_line):
                    break
                if re.findall(r'\d+\.\d{2}', next_line):
                    break
                desc.append(next_line)
                j += 1

            current['Description'] = ' '.join(desc)

            ref_match = re.search(r'UPI/[DC]R/(\d{12})', current['Description'])
            current['Ref No./Cheque No.'] = ref_match.group(1) if ref_match else None



            # Try to get Debit, Credit, Balance from the current or next line
            for k in range(j, min(j+3, len(lines))):
                nums = re.findall(r'(\d+\.\d{2})', lines[k])
                if len(nums) == 2:  # Debit + Balance or Credit + Balance
                    if "CREDIT" in lines[k].upper() or "CR/" in lines[k]:
                        current['Debit'] = None
                        current['Credit'] = float(nums[0])
                    else:
                        current['Debit'] = float(nums[0])
                        current['Credit'] = None
                    current['Balance'] = float(nums[-1])
                    break
                elif len(nums) == 3:  # Debit, Credit, Balance (rare)
                    current['Debit'] = float(nums[0])
                    current['Credit'] = float(nums[1])
                    current['Balance'] = float(nums[2])
                    break

    if current:
        transactions.append(current)

    return transactions

def parse_pdf_to_json(pdf_path, output_json_path=None):
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ''
        for page in pdf.pages:
            full_text += page.extract_text() + '\n'

    account_info = extract_statement_info(full_text)
    transactions = extract_transactions(full_text)
    account_info['Transactions'] = transactions

    if output_json_path:
        with open(output_json_path, 'w') as f:
            json.dump(account_info, f, indent=2)

    return account_info

# Example usage
if __name__ == "__main__":
    result = parse_pdf_to_json("abhay_original.pdf", "output_statement.json")
    print(json.dumps(result, indent=2))
