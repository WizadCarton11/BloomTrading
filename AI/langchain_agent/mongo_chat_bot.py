from langchain_groq import ChatGroq
import os
from langchain_core.output_parsers import StrOutputParser

from mongodb_atlas import MongoDBAtlas, MongoDBAtlasDocumentManager

from langchain_core.tools import tool
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.runnables.utils import ConfigurableFieldSpec
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.output_parsers import StrOutputParser

class MongoDBAtlasQA:
    def __init__(self, mongo_uri, db_name, collection_name, embedding, index_name, llm, conversation_id: str= "test_session"):
        """Initialize the MongoDB Atlas QA system."""
        try:
            self.atlas= MongoDBAtlas(db_name, collection_name)
            self.document_manager= MongoDBAtlasDocumentManager(atlas=self.atlas)  
            self.atlas.create_vector_store(
                embedding=embedding,
                index_name=index_name,
                relevance_score_fn="cosine",
            )
            self._prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", "You are a helpful assistant."),
                    # Placeholder for chat history
                    MessagesPlaceholder(variable_name="chat_history"),
                    ("human", "{query}"),
                ]
            )
            self.llm: ChatGroq=llm
            self.llm.bind_tools([self.get_similarity_search])
            self.llm= self._prompt| self.llm | StrOutputParser()
            
            self._config_fields = [
                ConfigurableFieldSpec(
                    id="user_id",
                    annotation=str,
                    name="User ID",
                    description="Unique identifier for a user.",
                    default="",
                    is_shared=True,
                ),
                ConfigurableFieldSpec(
                    id="conversation_id",
                    annotation=str,
                    name="Conversation ID",
                    description="Unique identifier for a conversation.",
                    default="",
                    is_shared=True,
                ),
            ]
            self.llm_with_history=RunnableWithMessageHistory(
                self.llm,
                self.get_chat_history,
                input_messages_key="query",
                history_messages_key="chat_history",
                history_factory_config=self._config_fields
            )
            self.config = {"configurable": {"user_id": "user1", "conversation_id": conversation_id}}
        except Exception as e:
            print(f"Error initializing MongoDBAtlasQA: {e}")

    def get_chat_history(self, user_id, conversation_id):
        try:
            return SQLChatMessageHistory(
                session_id=conversation_id,
                connection=os.getenv("POSTGRES_URI"),
            )
            
        except Exception as e:  
            print(f"Error retrieving chat history: {e}")
            return None

    @tool
    def get_similarity_search(self, query):
        """Perform a similarity search for info on stock market."""
        try:
            results = self.atlas.similarity_search(query)
            return results
        except Exception as e:
            print(f"Error performing similarity search: {e}")
            return None

    def query(self, text):
        """Query the knowledge base."""
        try:
            return self.llm_with_history.invoke(
                {"query": text}, self.config
            )
        except Exception as e:
            print(f"Error querying the knowledge base: {e}")
            return None
    
    