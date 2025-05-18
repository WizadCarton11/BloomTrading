from langchain_groq import ChatGroq
import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import yfinance as yf
from langchain.agents import AgentType, initialize_agent
from langchain_community.tools.yahoo_finance_news import YahooFinanceNewsTool
from langchain_groq import ChatGroq

from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

from pymongo.operations import SearchIndexModel
from langchain_community.vectorstores import AtlasDB
# from langchain_mongodb import MongoDBAtlasVectorSearch
# from pymongo import MongoClient
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.output_parsers import StrOutputParser
import PyPDF2
import pandas as pd
from langchain_core.documents import Document
from typing import Iterable
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter, CharacterTextSplitter, TokenTextSplitter
)
from langchain.text_splitter import NLTKTextSplitter
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables.utils import ConfigurableFieldSpec
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv(override=True)
# client.py

from mcp import ClientSession, StdioServerParameters

from mcp.client.stdio import stdio_client

from langchain_mcp_adapters.tools import load_mcp_tools

from langgraph.prebuilt import create_react_agent

from langchain_groq import ChatGroq

from langchain_openai import ChatOpenAI

import asyncio

import os


model = ChatGroq(model="llama3-8b-8192", temperature=0, api_key=os.environ["GROQ_API_KEY"])
server_params = StdioServerParameters(

    command="python",# Command to execute

    args=["mcp_server.py"] # Arguments for the command (our server script)

)
# model = ChatOpenAI(model="gpt-4o-mini", temperature=0)
async def run_agent():

    async with stdio_client(server_params) as (read, write):

        async with ClientSession(read, write) as session:

            await session.initialize()

            print("MCP Session Initialized.")

            tools = await load_mcp_tools(session)

            print(f"Loaded Tools: {[tool.name for tool in tools]}")

            agent = create_react_agent(model, tools)

            print("ReAct Agent Created.")

            print(f"Invoking agent with query")

            response = await agent.ainvoke({

                "messages": [("user", "Give me the analysis of MSFT")]

            })

            print("Agent invocation complete.")

            # Return the content of the last message (usually the agent's final answer)

            return response["messages"][-1].content

if __name__ == "__main__":

   # Run the asynchronous run_agent function and wait for the result

   print("Starting MCP Client...")

   result = asyncio.run(run_agent())

   print("\nAgent Final Response:")

   print(result)
