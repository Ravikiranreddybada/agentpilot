"""
RAG (Retrieval-Augmented Generation) Tools for agent orchestration.
"""

import os
import uuid
import logging
from typing import List, Dict, Any
from openai import AsyncOpenAI
from app.services.pinecone_service import pinecone_service

logger = logging.getLogger(__name__)

import httpx

JINA_API_KEY = os.getenv("JINA_API_KEY", "")

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start += (chunk_size - overlap)
    return chunks

async def _get_embedding(text: str) -> List[float]:
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            "https://api.jina.ai/v1/embeddings",
            headers={"Authorization": f"Bearer {JINA_API_KEY}"},
            json={"input": [text], "model": "jina-embeddings-v2-base-en"}
        )
        return response.json()["data"][0]["embedding"]

async def ingest_document(text: str, doc_name: str) -> str:
    """Chunks text, generates embeddings, and upserts to Pinecone."""
    try:
        if not pinecone_service.index:
            return "Error: Pinecone is not configured or initialized."
            
        chunks = chunk_text(text)
        vectors = []
        for i, chunk in enumerate(chunks):
            chunk_embedding = await _get_embedding(chunk)
            vectors.append({
                "id": f"{uuid.uuid4()}-{i}",
                "values": chunk_embedding,
                "metadata": {
                    "doc_name": doc_name,
                    "chunk_index": i,
                    "text": chunk
                }
            })
            
        await pinecone_service.upsert_chunks(vectors)
        return f"Successfully ingested document '{doc_name}' into {len(chunks)} chunks."
    except Exception as e:
        logger.error(f"Error in ingest_document: {e}")
        return f"Error: {e}"

async def retrieve_context(query: str, top_k: int = 5) -> str:
    """Retrieves similar chunks from Pinecone for a given query."""
    try:
        if not pinecone_service.index:
            return "Error: Pinecone is not configured or initialized."
            
        query_embedding = await _get_embedding(query)
        matches = await pinecone_service.query_similar(query_embedding, top_k=top_k)
        
        if not matches:
            return "No relevant context found in the knowledge base."
            
        results = []
        for match in matches:
            metadata = match.get("metadata", {})
            doc_name = metadata.get("doc_name", "Unknown")
            text = metadata.get("text", "")
            score = match.get("score", 0)
            results.append(f"[Source: {doc_name} | Score: {score:.3f}]\n{text}\n")
            
        return "RETRIEVED CONTEXT:\n\n" + "\n---\n".join(results)
    except Exception as e:
        logger.error(f"Error in retrieve_context: {e}")
        return f"Error: {e}"

async def list_documents() -> str:
    """Lists all ingested documents in Pinecone."""
    try:
        if not pinecone_service.index:
            return "Error: Pinecone is not configured or initialized."
            
        doc_names = await pinecone_service.get_all_doc_names()
        if not doc_names:
            return "No documents currently in the knowledge base."
        return f"Available documents in knowledge base: {', '.join(doc_names)}"
    except Exception as e:
        logger.error(f"Error in list_documents: {e}")
        return f"Error: {e}"

RAG_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "retrieve_context",
            "description": "Searches the vector knowledge base for text chunks relevant to the user's query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query or question."
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of context chunks to retrieve (default 5)."
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_documents",
            "description": "Lists all document names currently ingested in the knowledge base.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]
