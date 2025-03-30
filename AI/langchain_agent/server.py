import os
from fastapi import FastAPI
from pydantic import BaseModel
from mongo_chat_bot import MongoDBAtlasQA
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq

MONGO_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")
DB_NAME = "potato_trade"
COLLECTION_NAME = "vectorized_documents"
INDEX_NAME = "test_vector_index"
from dotenv import load_dotenv

load_dotenv(override=True)
llm = ChatGroq(model_name="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"), async_client=True)
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
qa_system = MongoDBAtlasQA(MONGO_URI, DB_NAME, COLLECTION_NAME, embedding, INDEX_NAME, llm)

app = FastAPI()

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
async def query_mongo(request: QueryRequest):
    response = qa_system.query(request.query)
    return {"response": response}
