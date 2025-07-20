from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
import logging
from server.services.bank_statement_llm import classify_bank_document_with_openai_local
from server.services.file_storage import save_uploaded_file
from server.app.models import ProcessedStatement
from server.app.db import get_db
import uuid
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

class FileURLRequest(BaseModel):
    file_url: str

@router.post("/analyze")
def analyze(request: FileURLRequest):
    return classify_bank_document_with_openai(request.file_url)

@router.post("/analyze-stream")
async def analyze_stream(file: UploadFile = File(...)):
    """
    Stream the analysis process in real-time.
    This eliminates the need for polling by sending progress updates directly.
    """
    
    async def generate_stream():
        try:
            # Generate session and file IDs
            session_id = str(uuid.uuid4())
            file_id = str(uuid.uuid4())
            
            # Send initial status
            yield f"data: {json.dumps({'type': 'status', 'message': 'Starting analysis...', 'session_id': session_id})}\n\n"
            
            # Save the uploaded file
            file_path = await save_uploaded_file(file, file_id)
            yield f"data: {json.dumps({'type': 'status', 'message': 'File uploaded successfully'})}\n\n"
            
            # Start processing
            yield f"data: {json.dumps({'type': 'status', 'message': 'Processing with AI...'})}\n\n"
            
            # Process the file (this is the main API call)
            result = classify_bank_document_with_openai_local(file_path, file.filename)
            
            # Send processing complete status
            yield f"data: {json.dumps({'type': 'status', 'message': 'Analysis complete'})}\n\n"
            
            # Store result in database
            db = next(get_db())
            processed_statement = ProcessedStatement(
                file_id=file_id,
                session_id=session_id,
                filename=file.filename,
                file_type=file.content_type,
                processing_failed=False,
                result=result,
                created_at=datetime.utcnow()
            )
            db.add(processed_statement)
            db.commit()
            
            # Send the final result
            yield f"data: {json.dumps({'type': 'result', 'data': result})}\n\n"
            
            # Send completion signal
            yield f"data: {json.dumps({'type': 'complete'})}\n\n"
            
        except Exception as e:
            # Send error status
            error_message = f"Processing failed: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"
            
            # Store error in database
            try:
                db = next(get_db())
                processed_statement = ProcessedStatement(
                    file_id=file_id,
                    session_id=session_id,
                    filename=file.filename,
                    file_type=file.content_type,
                    processing_failed=True,
                    result={"error": error_message, "filename": file.filename, "file_type": file.content_type, "processing_failed": True, "suggestion": "Please try uploading a different file format."},
                    created_at=datetime.utcnow()
                )
                db.add(processed_statement)
                db.commit()
            except Exception as db_error:
                logger.error(f"Failed to store error in database: {db_error}")
                # Don't fail the main operation if database storage fails
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )
