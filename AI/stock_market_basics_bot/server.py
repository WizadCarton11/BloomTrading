import os
from fastapi import FastAPI
from pydantic import BaseModel
from mongo_chat_bot import MongoDBAtlasQA
from langchain_huggingface import HuggingFaceEmbeddings
from mongo_chat_bot import RedisCacheManager

from langchain_groq import ChatGroq
import uvicorn
from dotenv import load_dotenv
load_dotenv(override=True)
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ["TRANSFORMERS_NO_TF"] = "1"

redis_host: str = os.getenv("REDIS_HOST", "localhost")
redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
redis_db: int = int(os.getenv("REDIS_DB", "0"))
cache_ttl: int = int(os.getenv("REDIS_CACHE_TTL", "3600"))
INDEX_NAME = "test_vector_index"
MONGO_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")
DB_NAME = "potato_trade"
COLLECTION_NAME = "vectorized_documents"
llm = ChatGroq(model_name="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"), async_client=True)
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

app = FastAPI()

class QueryRequest(BaseModel):
    query: str
    conversation_id: str 
    user_id: str

cache_manager= RedisCacheManager(redis_host, redis_port, redis_db, cache_ttl)
@app.post("/query")
async def query_mongo(request: QueryRequest):
    qa_system = MongoDBAtlasQA(MONGO_URI, DB_NAME, COLLECTION_NAME, embedding, INDEX_NAME, llm,
                                conversation_id=request.conversation_id, history_limit=10, 
                                user_id=request.user_id, cache_manager=cache_manager)
    response = qa_system.run(request.query)
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8080, reload=True)