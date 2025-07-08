from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Response, BackgroundTasks
from typing import List
from sqlalchemy.orm import Session
from uuid import uuid4
import json

from ..models import UploadedFile, ProcessedStatement
from ..auth import get_current_user
from ..db import SessionLocal
from ..services.ml_forwarder import trigger_ml_processing
from ..services.file_storage import save_file_to_disk, get_file_from_disk

router = APIRouter()

# 🔧 DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/debug-form")
async def debug_form(files: List[UploadFile] = File(...)):
    print("[DEBUG] Route hit!")
    return {"message": "It worked!"}


# ✅ Upload multiple files & trigger ML in background
@router.post("/upload-statement")
async def upload_statements(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"[DEBUG] Received {len(files)} files from user {user.email}")
    session_id = uuid4()
    stored_files = []

    for file in files:
        content = await file.read()
        file_id = uuid4()

        # Save file to disk instead of database
        file_path = save_file_to_disk(content, file.filename, str(file_id))

        stored = UploadedFile(
            id=file_id,
            user_id=user.id,
            session_id=session_id,
            filename=file.filename,
            content_type=file.content_type,
            file_path=file_path
        )

        db.add(stored)
        db.flush()       # get ID
        db.refresh(stored)

        stored_files.append(file.filename)

        # 🔁 Trigger ML processing in background
        background_tasks.add_task(
            trigger_ml_processing,
            file_id=str(stored.id),
            filename=file.filename,
            session_id=str(session_id),
            user_id=str(user.id),
            file_path=file_path
        )

    db.commit()

    return {
        "message": f"{len(stored_files)} files uploaded successfully. Processing in background...",
        "session_id": str(session_id),
        "files": stored_files,
        "status": "processing"
    }

# ✅ Allow ML to fetch stored file
@router.get("/file/{file_id}")
def get_file(file_id: str, db: Session = Depends(get_db)):
    file = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    return get_file_from_disk(file.file_path)

# ✅ Check processing status
@router.get("/status/{session_id}")
def get_processing_status(session_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    print(f"[DEBUG] Status check requested for session: {session_id}")
    print(f"[DEBUG] User: {user.email}")
    
    # Get all files for this session
    files = db.query(UploadedFile).filter(
        UploadedFile.session_id == session_id,
        UploadedFile.user_id == user.id
    ).all()
    
    # Get processed results
    processed = db.query(ProcessedStatement).filter(
        ProcessedStatement.session_id == session_id,
        ProcessedStatement.user_id == user.id
    ).all()
    
    print(f"[DEBUG] Status check - Files: {len(files)}, Processed: {len(processed)}")
    for file in files:
        print(f"[DEBUG] File: {file.filename}, ID: {file.id}")
    for p in processed:
        print(f"[DEBUG] Processed file_id: {p.file_id}, session_id: {p.session_id}")
    
    # Also check all processed statements for this user to see if there are any
    all_processed = db.query(ProcessedStatement).filter(
        ProcessedStatement.user_id == user.id
    ).all()
    print(f"[DEBUG] All processed statements for user: {len(all_processed)}")
    for p in all_processed:
        print(f"[DEBUG] All processed - file_id: {p.file_id}, session_id: {p.session_id}")
    
    file_status = []
    for file in files:
        # Convert file.id to string for comparison
        file_id_str = str(file.id)
        processed_file = next((p for p in processed if str(p.file_id) == file_id_str), None)
        
        print(f"[DEBUG] Checking file {file.filename} (ID: {file_id_str})")
        print(f"[DEBUG] Found processed file: {processed_file is not None}")
        
        file_status.append({
            "filename": file.filename,
            "status": "processed" if processed_file else "processing",
            "result": json.loads(processed_file.result_json) if processed_file else None
        })
    
    response_data = {
        "session_id": session_id,
        "total_files": len(files),
        "processed_files": len(processed),
        "files": file_status
    }
    
    print(f"[DEBUG] Returning status response: {response_data}")
    return response_data

# ✅ Get latest processed results for dashboard
@router.get("/latest-results")
def get_latest_results(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get the latest processed results for the user's dashboard."""
    
    # Get the most recent processed statement by timestamp
    latest_processed = db.query(ProcessedStatement).filter(
        ProcessedStatement.user_id == user.id
    ).order_by(ProcessedStatement.processed_at.desc()).first()
    
    if not latest_processed:
        return {"message": "No processed results found"}
    
    # Get the corresponding file info
    file_info = db.query(UploadedFile).filter(
        UploadedFile.id == latest_processed.file_id
    ).first()
    
    try:
        result_data = json.loads(latest_processed.result_json)
        return {
            "filename": file_info.filename if file_info else "Unknown",
            "processed_at": latest_processed.processed_at.isoformat() if latest_processed.processed_at else None,
            "result": result_data
        }
    except json.JSONDecodeError:
        return {"error": "Failed to parse result data"}

# ✅ Get results for a specific session
@router.get("/session-results/{session_id}")
def get_session_results(session_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """Get processed results for a specific session."""
    print(f"[DEBUG] Session results requested for session: {session_id}")
    print(f"[DEBUG] User: {user.email}")
    
    # Get all processed statements for this session
    processed_statements = db.query(ProcessedStatement).filter(
        ProcessedStatement.session_id == session_id,
        ProcessedStatement.user_id == user.id
    ).all()
    
    print(f"[DEBUG] Found {len(processed_statements)} processed statements for session {session_id}")
    
    if not processed_statements:
        print(f"[DEBUG] No processed results found for session {session_id}")
        return {"message": "No processed results found for this session"}
    
    results = []
    for processed in processed_statements:
        # Get the corresponding file info
        file_info = db.query(UploadedFile).filter(
            UploadedFile.id == processed.file_id
        ).first()
        
        print(f"[DEBUG] Processing result for file_id: {processed.file_id}")
        print(f"[DEBUG] File info: {file_info.filename if file_info else 'Unknown'}")
        
        try:
            result_data = json.loads(processed.result_json)
            print(f"[DEBUG] Successfully parsed result data for {file_info.filename if file_info else 'Unknown'}")
            print(f"[DEBUG] Result keys: {list(result_data.keys()) if isinstance(result_data, dict) else 'Not a dict'}")
            
            results.append({
                "filename": file_info.filename if file_info else "Unknown",
                "processed_at": processed.processed_at.isoformat() if processed.processed_at else None,
                "result": result_data
            })
        except json.JSONDecodeError as e:
            print(f"[DEBUG] JSON decode error for file {file_info.filename if file_info else 'Unknown'}: {e}")
            results.append({
                "filename": file_info.filename if file_info else "Unknown",
                "error": "Failed to parse result data"
            })
    
    response_data = {
        "session_id": session_id,
        "results": results
    }
    
    print(f"[DEBUG] Returning session results: {len(results)} results")
    return response_data
