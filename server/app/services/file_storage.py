import os
import shutil
from pathlib import Path
from uuid import uuid4
from fastapi import HTTPException
from fastapi.responses import FileResponse

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

def save_file_to_disk(file_content: bytes, filename: str, file_id: str) -> str:
    """Save file to disk and return the file path."""
    try:
        # Create a unique filename to avoid conflicts
        file_extension = Path(filename).suffix
        unique_filename = f"{file_id}{file_extension}"
        file_path = UPLOADS_DIR / unique_filename
        
        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return str(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

def get_file_from_disk(file_path: str) -> FileResponse:
    """Get file from disk and return as FileResponse."""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

def delete_file_from_disk(file_path: str):
    """Delete file from disk."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Failed to delete file {file_path}: {str(e)}")

def get_file_content(file_path: str) -> bytes:
    """Get file content as bytes."""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    with open(file_path, "rb") as f:
        return f.read() 