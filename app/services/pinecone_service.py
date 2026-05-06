"""
Pinecone service for managing vector embeddings.
"""

import os
import asyncio
from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "agentpilot-rag")
EMBEDDING_DIMENSION = 768  # nomic-embed-text-v1_5 dimension

class PineconeService:
    def __init__(self):
        if not PINECONE_API_KEY:
            self.pc = None
            self.index = None
            return
            
        self.pc = Pinecone(api_key=PINECONE_API_KEY)
        
        # Ensure index exists
        existing_indexes = [index_info["name"] for index_info in self.pc.list_indexes()]
        if PINECONE_INDEX_NAME not in existing_indexes:
            self.pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=EMBEDDING_DIMENSION,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
        
        self.index = self.pc.Index(PINECONE_INDEX_NAME)

    async def upsert_chunks(self, vectors: List[Dict[str, Any]]):
        if not self.index:
            raise ValueError("Pinecone is not initialized")
        # vectors should be: [{"id": "doc1-chunk1", "values": [...], "metadata": {"doc_name": "...", "text": "..."}}]
        return await asyncio.to_thread(self.index.upsert, vectors=vectors)

    async def query_similar(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.index:
            raise ValueError("Pinecone is not initialized")
        result = await asyncio.to_thread(
            self.index.query,
            vector=query_vector,
            top_k=top_k,
            include_metadata=True
        )
        return result.get("matches", [])

    async def delete_by_doc_name(self, doc_name: str) -> bool:
        if not self.index:
            raise ValueError("Pinecone is not initialized")
        # Note: pinecone serverless only supports deleting by ID or all.
        # But we can query to find all IDs with the metadata and then delete them.
        # This is a bit of a workaround. Let's fetch the IDs.
        dummy_vector = [0.0] * EMBEDDING_DIMENSION
        result = await asyncio.to_thread(
            self.index.query,
            vector=dummy_vector,
            filter={"doc_name": doc_name},
            top_k=10000,
            include_metadata=False
        )
        matches = result.get("matches", [])
        ids_to_delete = [match["id"] for match in matches]
        if ids_to_delete:
            await asyncio.to_thread(self.index.delete, ids=ids_to_delete)
        return True

    async def get_all_doc_names(self) -> List[str]:
        if not self.index:
            raise ValueError("Pinecone is not initialized")
        # Simple workaround: fetch some random vectors to get metadata
        dummy_vector = [0.0] * EMBEDDING_DIMENSION
        result = await asyncio.to_thread(
            self.index.query,
            vector=dummy_vector,
            top_k=10000,
            include_metadata=True
        )
        doc_names = set()
        for match in result.get("matches", []):
            if "doc_name" in match.get("metadata", {}):
                doc_names.add(match["metadata"]["doc_name"])
        return list(doc_names)

pinecone_service = PineconeService()
