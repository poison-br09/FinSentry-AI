# from server.services.bank_statement_llm import classify_bank_document_with_openai

from uuid import uuid4
from sqlalchemy.orm import Session
from ..services.bank_statement_llm import classify_bank_document_with_openai_local
from app.models import ProcessedStatement
from ..db import SessionLocal
from ..config import settings
import json


def trigger_ml_processing(file_id: str, filename: str, session_id: str, user_id: str, file_path: str):
    print(f"🚀 Starting ML processing for file: {filename}")
    # print(f"   File ID: {file_id}")
    # print(f"   Session ID: {session_id}")
    # print(f"   User ID: {user_id}")
    # print(f"   File path: {file_path}")
    
    try:
        # Use local file path instead of downloading from URL
        print(f"📊 Calling {settings.LLM_PROVIDER.upper()} API for {filename}...")
        result = classify_bank_document_with_openai_local(file_path, filename)
        result_json = json.dumps(result)
        
        print(f"✅ {settings.LLM_PROVIDER.upper()} processing completed for {filename}")
        # print(f"   Result keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")

        db: Session = SessionLocal()
        processed = ProcessedStatement(
            id=uuid4(),
            session_id=session_id,
            user_id=user_id,
            file_id=file_id,
            result_json=result_json,
        )
        db.add(processed)
        db.commit()
        db.close()

        print(f"✅ LLM result stored in database for {filename}")
        # print(f"   Session ID: {session_id}")
        # print(f"   File ID: {file_id}")
        
    except Exception as e:
        print(f"❌ Failed to process file {filename}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Store error result in database so frontend can display it
        try:
            file_extension = filename.lower()[filename.rfind('.'):] if '.' in filename else ''
            
            if "unable to view" in str(e).lower() or "images" in str(e).lower():
                suggestion = "The AI model was unable to process this image. This could be due to image quality, format issues, or content complexity. Please try uploading a clearer image or a different file format."
            elif "content policy" in str(e).lower():
                suggestion = "The AI model was unable to process this file. Please try uploading a different file format or ensure the document contains readable transaction data."
            else:
                suggestion = "Processing failed. Please try uploading a different file format (CSV, Excel, clear images, or PDFs) or ensure the document contains readable transaction data."
            
            error_result = {
                "error": str(e),
                "filename": filename,
                "file_type": file_extension,
                "processing_failed": True,
                "suggestion": suggestion
            }
            
            db: Session = SessionLocal()
            processed = ProcessedStatement(
                id=uuid4(),
                session_id=session_id,
                user_id=user_id,
                file_id=file_id,
                result_json=json.dumps(error_result),
            )
            db.add(processed)
            db.commit()
            db.close()
            
            print(f"✅ Error result stored in database for {filename}")
        except Exception as db_error:
            print(f"❌ Failed to store error result: {str(db_error)}")
