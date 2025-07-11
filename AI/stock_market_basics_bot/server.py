# server.py

import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import json

# Third-party
import uvicorn
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from prisma import Prisma, register

# Internal modules
from mongo_chat_bot import MongoDBAtlasQA, RedisCacheManager

# === Load environment and suppress TF warnings ===
def load_environment():
    load_dotenv(override=True)
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    os.environ['TRANSFORMERS_NO_TF'] = '1'

# === App and config setup ===
app = FastAPI()
prisma =  Prisma()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

def load_config():
    return {
        "redis": {
            "host": os.getenv("REDIS_HOST", "localhost"),
            "port": int(os.getenv("REDIS_PORT", "6379")),
            "db": int(os.getenv("REDIS_DB", "0")),
            "password": os.getenv("REDIS_PASSWORD", ""),
            "ttl": int(os.getenv("REDIS_CACHE_TTL", "3600"))
        },
        "mongo": {
            "uri": os.getenv("MONGODB_ATLAS_CLUSTER_URI"),
            "db": "potato_trade",
            "collection": "vectorized_documents"
        },
        "index_name": "test_vector_index",
        "groq_api_key": os.getenv("GROQ_API_KEY"),
        "llm_model": "llama3-8b-8192",
        "embedding_model": "sentence-transformers/all-MiniLM-L6-v2"
    }

# === LLM and embeddings ===
def init_services(config):
    llm = ChatGroq(
        model_name=config["llm_model"],
        api_key=config["groq_api_key"],
        async_client=True
    )
    embedding = HuggingFaceEmbeddings(model_name=config["embedding_model"])
    cache = RedisCacheManager(
        config["redis"]["host"],
        config["redis"]["port"],
        config["redis"]["db"],
        config["redis"]["ttl"],
        redis_password=config["redis"]["password"]
    )
    return llm, embedding, cache

# === Models ===
class QueryRequest(BaseModel):
    query: str
    conversation_id: str
    user_id: str

# === Lifecycle events ===
@app.on_event("startup")
async def startup():
    load_environment()
    await prisma.connect()
    # get the tables from prisma
    print(prisma)

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

# === Helper functions ===
from datetime import datetime

async def update_conversation_timestamp(conversation_id: str):
    """Update the updatedAt timestamp of a conversation."""
    try:
        await prisma.conversation.update(
            where={"id": conversation_id},
            data={"updatedAt": {"set": datetime.utcnow()}}
        )
    except Exception as e:
        print(f"Error updating conversation timestamp: {e}")


async def update_conversation_is_active(conversation_id: str, is_active: bool= True, title: str = None):
    """Update the isActive field of a conversation without waiting for the result."""
    try:
        print("title:", title)
        await prisma.conversation.update(
            where={"id": conversation_id},
            data={"isActive": is_active, "title": title} 
        )
    except Exception as e:
        # Log the error but don't interrupt the main flow
        print(f"Error updating conversation isActive status: {e}")
# === Initialize config and services ===
config = load_config()
llm, embedding, cache_manager = init_services(config)

# === Routes ===
@app.get("/start_conversation")
async def start_conversation(user_id: str = "default_user"):
    print(f"Starting conversation for user: {user_id}")
    conversation = await prisma.conversation.create(
        data={"title": "New Conversation", "userId": user_id}
    )
    return {"conversation_id": conversation.id}

@app.post("/query")
async def query_mongo(request: QueryRequest):
    # Start the conversation timestamp update in the background
    # We don't await this to avoid affecting query response time
    await update_conversation_timestamp(request.conversation_id)
    
    qa_system = MongoDBAtlasQA(
        config["mongo"]["uri"], config["mongo"]["db"], config["mongo"]["collection"],
        embedding, config["index_name"], llm,
        conversation_id=request.conversation_id,
        history_limit=10,
        user_id=request.user_id,
        cache_manager=cache_manager,
        enable_cache=False
    )
    response = qa_system.run_with_history_save(request.query)
    
    return {"response": response}

@app.post("/first_query")
async def first_query_mongo(request: QueryRequest):
    # Start the conversation timestamp update in the background
    # asyncio.create_task(update_conversation_is_active(request.conversation_id))
    
    qa_system = MongoDBAtlasQA(
        config["mongo"]["uri"], config["mongo"]["db"], config["mongo"]["collection"],
        embedding, config["index_name"], llm,
        conversation_id=request.conversation_id,
        history_limit=10,
        user_id=request.user_id,
        cache_manager=cache_manager,
        enable_cache=False
    )
    response = qa_system.run_with_title_and_history_save(request.query)
    print(f"Response title: {response['title']}")  
    await update_conversation_is_active(request.conversation_id, True, response['title'])
    return {"response": response}

@app.get("/get_user_conversations")
async def get_user_conversations(user_id: str = "default_user"):
    print(user_id)
    conversations = await prisma.conversation.find_many(where={"userId": user_id, "isActive": True}, order={"updatedAt": "desc"})
    return {"conversations": conversations}

import json
from fastapi import FastAPI

@app.get("/get_conversation_history")
async def get_conversation_history(conversation_id: str):
    history_raw = await prisma.basic_stock_info_vector_search_chat_history.find_many(
        where={"session_id": conversation_id},
        order={"createdAt": "asc"}
    )

    formatted_history = []
    for item in history_raw:
        # Convert model instance to a dict
        item_dict = item.__dict__.copy()

        try:
            item_dict["message"] = json.loads(item.message)
        except (json.JSONDecodeError, TypeError):
            item_dict["message"] = {"error": "Failed to parse message JSON"}

        formatted_history.append(item_dict)

    return {"history": formatted_history}

# === Entrypoint ===
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=6081, reload=True)
