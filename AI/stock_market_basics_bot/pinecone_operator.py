from pinecone import Pinecone
import uuid
from langchain_core.documents import Document
from typing import List
import os
class PineconeOperator:
    def __init__(self, model='llama-text-embed-v2'):
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.index = pc.Index(host=os.getenv("PINECONE_HOST"))
        
        self.items = []
        self.model = model

    def upload_documents(self, documents: Document, namespace="default"):
        """
        Upload raw text documents using Pinecone server-side embedding.
        Each document must have .page_content and .metadata.
        """
        self.items = []
        for doc in documents:
            self.items.append({
                "_id": str(uuid.uuid4()),
                "text": doc.page_content,
                "metadata": doc.metadata['source']
            })

        if not self.items:
            raise ValueError("No documents to upload. Please provide valid documents.")
        
        self.index.upsert_records("example-namespace", self.items)
        print(f"Uploaded {len(self.items)} document(s) to Pinecone.")
    
    def query(self, query_text: str, top_k: int = 5, namespace: str = "default"):
        """
        Perform a semantic search using server-side inference.
        """
        if not query_text:
            raise ValueError("Query text cannot be empty.")
        if not isinstance(query_text, str):
            raise TypeError("Query text must be a string.")

        response= self.index.search(
            namespace="example-namespace", 
            query={
                "inputs": {"text": query_text},
                "top_k": 4
            },
            fields=[ "text", "metadata"],
        )

        
        return response
