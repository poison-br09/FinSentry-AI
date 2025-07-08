import openai
import requests
import json

# Configure your OpenAI API key
openai.api_key = "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" 

# Prompt to instruct LLM to extract and analyze bank statement
SYSTEM_PROMPT = """
You are a financial document analyst.

Given a bank account statement (PDF, Excel, CSV, or image), extract:
- Account metadata: Account_Name, Account_Number, Bank_Name, IFSC_Code
- List of transactions in the format:
  {
    Date: "",
    DR/CR: "",
    Description: "",
    Ref No./Chq_no: "",
    Transaction_Amount: float,
    Balance: float
  }

Then, categorize transactions into flexible spending categories such as groceries, utilities, subscriptions, travel, dining, health, etc.

Finally:
- Detect anomalies or fraud-like patterns using amount spikes, duplicates, or irregular frequency
- Generate insights such as:
  - Monthly/weekly breakdowns
  - Spending alerts (e.g., high category usage)
  - Suggestions for saving or expense control

Respond ONLY in JSON format with the structure:
{
  "Account_Name": "",
  "Account_Number": "",
  "Bank_Name": "",
  "IFSC_Code": "",
  "categorized_transactions": {
    "category1": [ {transaction}, ... ],
    ...
  },
  "alerts": [ ... ],
  "insights": {
    "monthly_summary": { "Month": { "category": amount, ... } },
    "recommendations": [ ... ]
  }
}
"""

def download_file_from_url(url: str) -> tuple[str, bytes]:
    """Downloads file from a URL and returns filename and content bytes."""
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to download file: {response.status_code}")
    content_disposition = response.headers.get("content-disposition", "")
    filename = (
        content_disposition.split("filename=")[-1].strip('"')
        if "filename=" in content_disposition
        else url.split("/")[-1]
    )
    return filename, response.content

def classify_bank_document_with_openai(file_url: str, model="gpt-4o") -> dict:
    """Processes a bank document using OpenAI API."""
    filename, file_bytes = download_file_from_url(file_url)

    # Upload file to OpenAI
    file_upload = openai.files.create(file=(filename, file_bytes), purpose="assistants")
    file_id = file_upload.id

    # Call OpenAI with file reference
    response = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze the attached bank statement and follow the instructions."},
                    {"type": "file", "file_id": file_id}
                ]
            }
        ]
    )

    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        raise ValueError("The model did not return a valid JSON. Raw output:\n" + content)
