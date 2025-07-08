from fastapi import APIRouter
from pydantic import BaseModel
from server.services.bank_statement_llm import classify_bank_document_with_openai

router = APIRouter()

class FileURLRequest(BaseModel):
    file_url: str

@router.post("/analyze")
def analyze(request: FileURLRequest):
    return classify_bank_document_with_openai(request.file_url)
