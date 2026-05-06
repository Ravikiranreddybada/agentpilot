"""
RAG Router
"""
import io
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from pypdf import PdfReader
from app.core.security import get_current_user
from app.tools.rag_tools import ingest_document
from app.services.pinecone_service import pinecone_service

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/ingest")
async def ingest_document_endpoint(
    text: Optional[str] = Form(None),
    doc_name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    claims: dict = Depends(get_current_user)
):
    """
    Ingests a document (via file upload or raw text) into the RAG knowledge base.
    """
    if not file and not text:
        raise HTTPException(status_code=400, detail="Must provide either 'file' or 'text'")

    content = ""
    name = doc_name
    
    if file:
        name = name or file.filename or "uploaded_file"
        try:
            file_bytes = await file.read()
            if file.filename and file.filename.lower().endswith(".pdf"):
                pdf = PdfReader(io.BytesIO(file_bytes))
                for page in pdf.pages:
                    content += page.extract_text() + "\n"
            else:
                content = file_bytes.decode('utf-8', errors='replace')
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
    else:
        name = name or "raw_text_document"
        content = text

    if not content.strip():
        raise HTTPException(status_code=400, detail="Document content is empty")

    result = await ingest_document(content, name)
    if result.startswith("Error:"):
        raise HTTPException(status_code=500, detail=result)
        
    return {
        "success": True,
        "message": result,
        "doc_name": name
    }

@router.get("/documents")
async def get_documents(claims: dict = Depends(get_current_user)):
    """
    Returns a list of all ingested document names.
    """
    try:
        if not pinecone_service.index:
            raise HTTPException(status_code=500, detail="Pinecone is not initialized")
        doc_names = await pinecone_service.get_all_doc_names()
        return {"documents": doc_names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{doc_name}")
async def delete_document(doc_name: str, claims: dict = Depends(get_current_user)):
    """
    Deletes a document from the RAG knowledge base.
    """
    try:
        if not pinecone_service.index:
            raise HTTPException(status_code=500, detail="Pinecone is not initialized")
        await pinecone_service.delete_by_doc_name(doc_name)
        return {"success": True, "deleted": doc_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
