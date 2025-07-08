# def classify_bank_document_with_openai_local(file_path: str, filename: str, model="gpt-4o") -> dict:
#     """Processes a local bank document using OpenAI API - supports all file types."""
    
#     # Read file from local path
#     with open(file_path, "rb") as f:
#         file_bytes = f.read()

#     client = openai.OpenAI(api_key=openai.api_key)
    
#     # Check if it's an image file
#     image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif'}
#     file_extension = filename.lower()[filename.rfind('.'):] if '.' in filename else ''
    
#     if file_extension in image_extensions:
#         # Use vision API for images
#         response = client.chat.completions.create(
#             model=model,
#             messages=[
#                 {"role": "system", "content": SYSTEM_PROMPT},
#                 {
#                     "role": "user",
#                     "content": [
#                         {"type": "text", "text": "Analyze the attached bank statement image and follow the instructions."},
#                         {
#                             "type": "image_url",
#                             "image_url": {
#                                 "url": f"data:image/{file_extension[1:]};base64,{base64.b64encode(file_bytes).decode('utf-8')}"
#                             }
#                         }
#                     ]
#                 }
#             ]
#         )
#     else:
#         # For non-image files, try to upload as a file
#         try:
#             # Upload file to OpenAI
#             file_upload = client.files.create(file=(filename, file_bytes), purpose="assistants")
#             file_id = file_upload.id

#             # Call OpenAI with file reference
#             response = client.chat.completions.create(
#                 model=model,
#                 messages=[
#                     {"role": "system", "content": SYSTEM_PROMPT},
#                     {
#                         "role": "user",
#                         "content": [
#                             {"type": "text", "text": "Analyze the attached bank statement and follow the instructions."},
#                             {"type": "file", "file": {"file_id": file_id}}
#                         ]
#                     }
#                 ]
#             )
#         except Exception as e:
#             # If file upload fails, try to read and send as text
#             if file_extension in {'.txt', '.csv'}:
#                 try:
#                     with open(file_path, 'r', encoding='utf-8') as f:
#                         file_content = f.read()
                    
#                     response = client.chat.completions.create(
#                         model=model,
#                         messages=[
#                             {"role": "system", "content": SYSTEM_PROMPT},
#                             {
#                                 "role": "user",
#                                 "content": f"Analyze the following bank statement content and follow the instructions:\n\n{file_content}"
#                             }
#                         ]
#                     )
#                 except UnicodeDecodeError:
#                     # If UTF-8 fails, try with binary reading
#                     with open(file_path, 'rb') as f:
#                         file_content = f.read().decode('latin-1', errors='ignore')
                    
#                     response = client.chat.completions.create(
#                         model=model,
#                         messages=[
#                             {"role": "system", "content": SYSTEM_PROMPT},
#                             {
#                                 "role": "user",
#                                 "content": f"Analyze the following bank statement content and follow the instructions:\n\n{file_content}"
#                             }
#                         ]
#                     )
#             else:
#                 # For other file types, try to convert to text or raise error
#                 raise Exception(f"Unsupported file type: {file_extension}. Please convert to a supported format.")

#     content = response.choices[0].message.content
    
#     # Clean the content to remove markdown formatting and extra text
#     if content.startswith("```json"):
#         content = content[7:]  # Remove ```json
#     if content.endswith("```"):
#         content = content[:-3]  # Remove ```
    
#     # Find the end of the JSON object (last closing brace)
#     last_brace = content.rfind("}")
#     if last_brace != -1:
#         content = content[:last_brace + 1]  # Keep only up to the last closing brace
    
#     # Remove any extra text after the JSON
#     content = content.strip()
    
#     print(f"[DEBUG] Cleaned JSON content: {content[:200]}...")  # Debug the cleaned content
    
#     try:
#         return json.loads(content)
#     except json.JSONDecodeError as e:
#         print(f"[DEBUG] JSON parsing error: {e}")
#         print(f"[DEBUG] Full content: {content}")
#         raise ValueError("The model did not return a valid JSON. Raw output:\n" + content)
