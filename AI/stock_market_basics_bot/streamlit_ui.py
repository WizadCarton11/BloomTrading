from langchain_groq import ChatGroq
import os
from mongo_chat_bot import MongoDBAtlasQA
# from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv(override=True)

# ---- Config ---- #
INDEX_NAME = "test_vector_index"
MONGO_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")
DB_NAME = "potato_trade"
COLLECTION_NAME = "vectorized_documents"
llm = ChatGroq(model_name="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY"), async_client=True)
embedding = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# ---- Init MongoDB QA ---- #
qa_system = MongoDBAtlasQA(
    mongo_uri=MONGO_URI,
    db_name=DB_NAME,
    collection_name=COLLECTION_NAME,
    embedding=embedding,
    index_name=INDEX_NAME,
    llm=llm,
    conversation_id="abc123"
)

import streamlit as st

st.set_page_config(page_title="MongoDB LLM Chat", page_icon="💬")
st.title("💬 MongoDB LLM Assistant")

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

prompt = st.chat_input("Ask a question...")

if prompt:
    st.chat_message("user").markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    response = qa_system.query(prompt)
    st.chat_message("assistant").markdown(response)
    st.session_state.messages.append({"role": "assistant", "content": response})

