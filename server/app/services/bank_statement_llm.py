#todo Account number consistency checks across multiple uploaded files are deferred for now

import requests, json, base64, mimetypes
from ..config import settings
from .llm_client import llm_client 


SYSTEM_PROMPT = """
You are a financial document analyst AI designed to analyze bank statements for spending patterns and financial insights.

You MUST extract the requested data from a bank statement (PDF, Excel, CSV, or image). Your ONLY allowed output is a valid JSON object in the format specified below.

IMPORTANT: This is for legitimate financial analysis and budgeting purposes. You are analyzing financial documents to help users understand their spending patterns and make better financial decisions.

Do not include explanations, markdown, or extra formatting. If input includes multiple files, assume they belong to the same user.

🔒 Account Validation Rule:
- This rule ONLY applies when multiple SEPARATE files are uploaded simultaneously.
- If analyzing a single file (even if it has multiple pages), extract ALL account information and transactions from that file.
- Only return the multiple account error if you are explicitly told that multiple files were uploaded AND they contain different account numbers.
- For single files, extract the primary account details and proceed with analysis.

1. Account metadata:
   - Account_Name: Primary account holder name
   - Account_Number: Primary account number (if multiple found, use the most prominent one)
   - Bank_Name: Bank name
   - IFSC_Code: IFSC code
   - Total_Transactions: total number of transactions

2. Categorized transactions:
   - Categorize every transaction — including both DR (debit) and CR (credit) — into types like: groceries, utilities, subscriptions, travel, dining, health, shopping, refunds, salary, investments, etc.
   - If a transaction does not clearly match any known category, label it as "other".
   - For each category:
     - total_amount: sum of all transaction amounts
     - total_transactions: number of transactions
     - monthly_breakdown: month-wise amount spent
     - monthly_transaction_count: month-wise number of transactions
     - monthly_transactions: detailed transaction list for each month with the following structure:
       {
         "Month Year": [
           {
             "date": "DD MMM YYYY",
             "description": "Transaction description",
             "amount": float,
             "type": "DR" or "CR",
             "balance": float,
             "ref_no": "Reference number if available"
           }
         ]
       }

3. Financial alerts and insights:
   - Detect anomalies such as:
     - Spending spikes
     - Duplicate charges
     - Large infrequent expenses
   - Detect behavioral patterns:
     - Frequent transfers to the same UPI ID or merchant
     - Repeated payments with similar amounts (EMIs, subscriptions)
     - Payments through same mode (credit card, debit card, ATM)
   - Generate alerts like:
     - "High spending in subscriptions for April (₹2,800, 5 transactions)"
     - "Frequent transfers to UPI ID `xyz@oksbi` in June (7 transfers, ₹4,200)"
     - "Multiple payments to `Amazon.in` via debit card within 3 days"
   - Provide actionable recommendations:
     - "Review repeated transfers to `xyz@oksbi` — possible subscription or rent"
     - "Consolidate multiple UPI payments to the same merchant"
     - "Avoid using both credit and debit cards for `Zomato` — consider streamlining"
     - "Set monthly caps for high-frequency categories like dining or shopping"

⚠️ IMPORTANT:
- Do NOT skip any transaction — all must be categorized.
- Output must be valid JSON only.
- Do NOT use commas in numbers (e.g., use 3700.00 instead of 3,700.00).
- Do NOT include any comments, explanations, or markdown formatting in the JSON.
- Ensure monthly totals align with transaction count and amounts.
- This is for legitimate financial analysis and budgeting purposes.
- For single files, extract ALL available data regardless of page count or sections.

Use the following JSON structure:

{
  "Account_Name": "",
  "Account_Number": "",
  "Bank_Name": "",
  "IFSC_Code": "",
  "Total_Transactions": int,
  "categorized_transactions": {
    "category_name": {
      "total_amount": float,
      "total_transactions": int,
      "monthly_breakdown": {
        "Month Year": float,
        ...
      },
      "monthly_transaction_count": {
        "Month Year": int,
        ...
      },
      "monthly_transactions": {
        "Month Year": [
          {
            "date": "DD MMM YYYY",
            "description": "Transaction description",
            "amount": float,
            "type": "DR" or "CR",
            "balance": float,
            "ref_no": "Reference number if available"
          }
        ],
        ...
      }
    },
    ...
  },
  "alerts": [ ... ],
  "insights": {
    "recommendations": [ ... ]
  }
}
"""


def download_file_from_url(url: str) -> tuple[str, bytes]:
    """Downloads file from a URL and returns filename and content bytes."""
    response = requests.get(url, timeout=30)  # 30 second timeout
    if response.status_code != 200:
        raise Exception(f"Failed to download file: {response.status_code}")
    content_disposition = response.headers.get("content-disposition", "")
    filename = (
        content_disposition.split("filename=")[-1].strip('"')
        if "filename=" in content_disposition
        else url.split("/")[-1]
    )
    return filename, response.content

def classify_bank_document_with_openai(file_url: str) -> dict:
    """Processes a bank document using universal LLM API."""
    filename, file_bytes = download_file_from_url(file_url)

    # Upload file using universal client
    file_id = llm_client.file_upload(file=(filename, file_bytes), purpose="assistants")

    # Call LLM with file reference
    response = llm_client.chat_completion(
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
    print(f"[DEBUG] Sending base64 payload: {filename}, {len(file_bytes)} bytes")

    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        raise ValueError("The model did not return a valid JSON. Raw output:\n" + content)

def classify_bank_document_with_openai_local(file_path: str, filename: str) -> dict:
    """Processes a local bank document using universal LLM API - supports all file types."""
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    file_extension = filename.lower()[filename.rfind('.'):] if '.' in filename else ''
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif'}
    
    print(f"[DEBUG] Processing file: {filename} with extension: {file_extension}")

    try:
        if file_extension in image_extensions:
            return _process_image_file(file_path, filename, file_bytes, file_extension)
        elif file_extension in {'.txt', '.csv'}:
            return _process_text_file(file_path, filename, file_extension)
        elif file_extension in {'.xlsx', '.xls'}:
            return _process_excel_file(file_path, filename, file_bytes)
        elif file_extension == '.pdf':
            return _process_pdf_file(file_path, filename, file_bytes)
        else:
            # Try as text file for unknown extensions
            return _process_text_file(file_path, filename, file_extension)
    except Exception as e:
        print(f"[DEBUG] Processing failed for {filename}: {str(e)}")
        raise e

def _process_image_file(file_path, filename, file_bytes, file_extension):
    """Process image files using universal LLM Vision API."""
    # Use default MIME if guessing fails
    mime_type = mimetypes.guess_type(filename)[0] or "image/png"

    # Encode image to base64
    b64_image = base64.b64encode(file_bytes).decode("utf-8")
    base64_url = f"data:{mime_type};base64,{b64_image}"
    
    # Debug size
    print(f"[DEBUG] Base64 image payload size: {len(base64_url)} characters")

    # Ensure payload isn't too big (roughly < 20MB)
    if len(base64_url) > 20_000_000:
        raise ValueError("Image is too large to process. Please compress or resize the image.")

    try:
        response = llm_client.vision_completion(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this bank statement image and extract the required information in JSON format."},
                        {
                            "type": "image_url",
                            "image_url": {"url": base64_url}
                        }
                    ]
                }
            ]
        )

        return _parse_response(response.choices[0].message.content)

    except Exception as e:
        print(f"[DEBUG] Vision API image processing failed: {str(e)}")
        raise ValueError("Vision model failed to process the image. Ensure it's a valid, clear image (PNG, JPEG, etc.) under 20MB.")

def _process_pdf_file(file_path, filename, file_bytes):
    """Process PDF files using universal LLM file upload API."""
    try:
        print(f"[DEBUG] Attempting to process PDF using file upload API: {filename}")
        file_id = llm_client.file_upload(file_path, purpose="assistants")

        response = llm_client.chat_completion(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze the attached bank statement PDF and extract the required information."},
                        {"type": "file", "file_id": file_id}
                    ]
                }
            ]
        )
        
        return _parse_response(response.choices[0].message.content)
    except Exception as e:
        print(f"[DEBUG] PDF file upload processing failed: {str(e)}")
        print(f"[DEBUG] Attempting fallback to text extraction for PDF: {filename}")
        
        # If file upload fails, just raise the original error
        raise ValueError(f"PDF processing failed: {str(e)}. Please try uploading a different file format or ensure the PDF contains readable text.")

def _process_text_content(text_content, filename):
    """Process text content extracted from files."""
    response = llm_client.chat_completion(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Analyze this bank statement text and extract the required information:\n\n{text_content}"
            }
        ]
    )

    return _parse_response(response.choices[0].message.content)

def _process_text_file(file_path, filename, file_extension):
    """Process text-based files (CSV, TXT)."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()
    except UnicodeDecodeError:
        with open(file_path, 'rb') as f:
            file_content = f.read().decode('latin-1', errors='ignore')

    response = llm_client.chat_completion(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze the following bank statement data and extract the required information:\n\n{file_content}"}
        ]
    )

    return _parse_response(response.choices[0].message.content)

def _process_excel_file(file_path, filename, file_bytes):
    """Process Excel files."""
    try:
        file_id = llm_client.file_upload(file_path, purpose="assistants")

        response = llm_client.chat_completion(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze the attached bank statement and extract the required information."},
                        {"type": "file", "file_id": file_id}
                    ]
                }
            ]
        )
        
        return _parse_response(response.choices[0].message.content)
    except Exception as e:
        print(f"[DEBUG] Excel processing failed: {str(e)}")
        # Fallback to text extraction if file upload fails
        return _process_text_file(file_path, filename, '.txt')

def _parse_response(content):
    """Parse and clean the response content."""
    if content.startswith("```json"):
        content = content[7:]
    if content.endswith("```"):
        content = content[:-3]

    last_brace = content.rfind("}")
    if last_brace != -1:
        content = content[:last_brace + 1]

    content = content.strip()

    print(f"[DEBUG] Cleaned JSON content: {content[:200]}...")

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print(f"[DEBUG] JSON parsing error: {e}")
        print(f"[DEBUG] Full content: {content}")
        
        # Try to fix common JSON issues
        try:
            # Fix numbers with commas (e.g., 3,700.00 -> 3700.00)
            import re
            # Pattern to match numbers with commas in JSON values
            # This regex looks for: "amount": 3,700.00 or "amount": 1,574.50
            content = re.sub(r':\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)', lambda m: ': ' + m.group(1).replace(',', ''), content)
            
            # Remove JavaScript-style comments (// ...)
            content = re.sub(r'\s*//.*$', '', content, flags=re.MULTILINE)
            
            # Try parsing again
            return json.loads(content)
        except (json.JSONDecodeError, Exception) as fix_error:
            print(f"[DEBUG] JSON fix attempt failed: {fix_error}")
        
        # Check if it's a content policy rejection or processing issue
        content_lower = content.lower()
        
        # Check for common AI refusal patterns
        if any(phrase in content_lower for phrase in [
            "i can't do that", "i cannot", "i'm unable", "i am unable", 
            "sorry, i cannot", "i'm sorry, but", "i cannot help",
            "multiple bank account numbers detected"
        ]):
            # Extract the actual error message from the AI response
            if "multiple bank account numbers detected" in content_lower:
                raise ValueError("The AI detected multiple account numbers in your file. Please ensure you're uploading a single account statement. If your statement has multiple pages, that's fine - just make sure it's all for the same account.")
            else:
                # Try to extract the actual reason from the AI's response
                lines = content.split('\n')
                for line in lines:
                    if line.strip() and not line.startswith('I') and not line.startswith('Sorry'):
                        raise ValueError(f"The AI was unable to process this file: {line.strip()}")
                raise ValueError("The AI was unable to process this file. Please try uploading a clearer image or a different file format.")
        
        # Check for other processing issues
        if ("unable to process" in content_lower and "bank statements" in content_lower) or \
           ("cannot process" in content_lower and "bank" in content_lower) or \
           ("unable to view or analyze images" in content_lower and "financial documents" in content_lower) or \
           ("unable to view" in content_lower and "images" in content_lower) or \
           ("unable to help" in content_lower and "extracting data" in content_lower):
            raise ValueError("The AI model was unable to process this file. This could be due to image quality, file format issues, or content complexity. Please try uploading a clearer image, a different file format, or ensure the document contains readable transaction data.")
        
        raise ValueError("The model did not return a valid JSON. Raw output:\n" + content)

