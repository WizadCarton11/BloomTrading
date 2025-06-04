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

from langchain.chains import SequentialChain
from mongodb_atlas import MongoDBAtlas, MongoDBAtlasDocumentManager
from langchain_core.runnables import RunnableLambda, RunnableConfig
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain.agents import AgentType, initialize_agent
from langchain_groq import ChatGroq
import os
from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import tool
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain_core.runnables.utils import ConfigurableFieldSpec
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.runnables import RunnableLambda
from langchain_core.messages import SystemMessage
from langchain.agents import AgentType, initialize_agent

from mongodb_atlas import MongoDBAtlas, MongoDBAtlasDocumentManager


class LimitedSQLChatMessageHistory(SQLChatMessageHistory):
    """Custom SQLChatMessageHistory that limits the number of messages returned."""
    
    def __init__(self, *args, message_limit: int = 5, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_limit = message_limit
    
    @property
    def messages(self):
        """Retrieve the last N messages from the chat history."""
        all_messages = super().messages
        return all_messages[-self.message_limit:] if len(all_messages) > self.message_limit else all_messages


class PromptManager:
    """Manages all prompt templates for the QA system."""
    
    @staticmethod
    def get_base_prompt():
        """Get the base system prompt template."""
        return ChatPromptTemplate.from_messages([
            SystemMessage(
                content="You are a helpful assistant that answers questions about stock market data."
            ),
            ("human", "{query}"),
        ])
    
    @staticmethod
    def get_history_prompt():
        """Get the history-aware prompt template."""
        return ChatPromptTemplate.from_messages([
            SystemMessage(
                content="You are a helpful assistant. Read the query and if it is vague look at the chat history to get more context else pass the query as it is. Output a consise query only do not answer the query."
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{query}"),
        ])
    
    @staticmethod
    def get_summary_prompt():
        """Get the summary prompt template."""
        return ChatPromptTemplate.from_messages([
            SystemMessage(
                content="You are a helpful assistant that structures, formats and add details to answers based on the provided base knowledge and user query."
            ),
            ("human", "{text}"),
        ])


class LLMChainManager:
    """Manages LLM chains and their configurations."""
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        self.prompt_manager = PromptManager()
        self._setup_chains()
    
    def _setup_chains(self):
        """Initialize all LLM chains."""
        # Base chains
        self.no_prompt_llm = self.llm | StrOutputParser()
        self.base_llm_chain = self.prompt_manager.get_base_prompt() | self.llm | StrOutputParser()
        self.history_llm_chain = self.prompt_manager.get_history_prompt() | self.llm | StrOutputParser()
        self.summary_llm_chain = self.prompt_manager.get_summary_prompt() | self.no_prompt_llm
    
    def get_base_chain(self):
        return self.base_llm_chain
    
    def get_history_chain(self):
        return self.history_llm_chain
    
    def get_summary_chain(self):
        return self.summary_llm_chain
    
    def get_no_prompt_chain(self):
        return self.no_prompt_llm


class ChatHistoryManager:
    """Manages chat history operations."""
    
    def __init__(self, history_limit: int = 2):
        self.history_limit = history_limit
        self.table_name = "basic_stock_info_vector_search_chat_history"
        self.postgres_uri = os.getenv("POSTGRES_URI")
    
    def get_limited_chat_history(self, user_id: str, conversation_id: str):
        """Get chat history with limited number of messages."""
        try:
            return LimitedSQLChatMessageHistory(
                table_name=self.table_name,
                session_id=conversation_id,
                connection=self.postgres_uri,
                message_limit=self.history_limit
            )
        except Exception as e:  
            print(f"Error retrieving chat history: {e}")
            return None

    def get_alternative_limited_history(self, user_id: str, conversation_id: str):
        """Alternative approach: manually limit messages after retrieval."""
        try:
            full_history = SQLChatMessageHistory(
                table_name=self.table_name,
                session_id=user_id+conversation_id,
                connection=self.postgres_uri,
            )
            
            # Get all messages and limit them
            all_messages = full_history.messages
            limited_messages = all_messages[-self.history_limit:] if len(all_messages) > self.history_limit else all_messages
            
            # Create a new history object with limited messages
            limited_history = SQLChatMessageHistory(
                table_name=self.table_name,
                session_id=f"{conversation_id}_limited",
                connection=self.postgres_uri,
            )
            
            # Clear and add limited messages
            limited_history.clear()
            for message in limited_messages:
                limited_history.add_message(message)
                
            return limited_history
            
        except Exception as e:  
            print(f"Error retrieving limited chat history: {e}")
            return None


class VectorSearchManager:
    """Manages vector search operations."""
    
    def __init__(self, atlas: MongoDBAtlas):
        self.atlas = atlas
    
    def create_search_tool(self):
        """Create the similarity search tool."""
        @tool(description="Perform a similarity search for info on stock market.")
        def get_similarity_search(text):
            """
            Perform a similarity search for info on stock market.
            
            Args:
                text (str): The query string to search for.
            Returns:
                List[Document]: A list of documents that match the query.
            """
            try:
                results = self.atlas.similarity_search(text, k=5)
                return results
            except Exception as e:
                print(f"Error performing similarity search: {e}")
                return None
        
        return get_similarity_search
    
    def similarity_search(self, query: str, k: int = 2):
        """Perform similarity search."""
        try:
            return self.atlas.similarity_search(query, k=k)
        except Exception as e:
            print(f"Error performing similarity search: {e}")
            return []


class AgentManager:
    """Manages agent operations."""
    
    def __init__(self, llm_chain, vector_search_manager: VectorSearchManager):
        self.llm_chain = llm_chain
        self.vector_search_manager = vector_search_manager
    
    def create_react_agent(self):
        """Create a ReAct agent with search tools."""
        tools = [self.vector_search_manager.create_search_tool()]
        agent = initialize_agent(
            tools=tools,
            llm=self.llm_chain,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True
        )
        return agent


class ChainBuilder:
    """Builds complex chains for the QA system."""
    
    def __init__(self, llm_manager: LLMChainManager, history_manager: ChatHistoryManager, 
                 vector_manager: VectorSearchManager, config_fields: list):
        self.llm_manager = llm_manager
        self.history_manager = history_manager
        self.vector_manager = vector_manager
        self.config_fields = config_fields
    
    def build_history_aware_chain(self, config: dict):
        """Build a chain that uses chat history."""
        return RunnableWithMessageHistory(
            self.llm_manager.get_history_chain(),
            self.history_manager.get_limited_chat_history,
            input_messages_key="query",
            history_messages_key="chat_history",
            history_factory_config=self.config_fields
        ).with_config(config)
    
    def build_full_qa_chain(self, config: dict):
        """Build the complete QA chain."""
        # Step 1: Refine query using limited chat history
        refine_query = self.build_history_aware_chain(config)

        # Step 2: Similarity search as a lambda
        similarity_search = RunnableLambda(lambda refined_query: {
            "refined_query": refined_query,
            "documents": self.vector_manager.similarity_search(refined_query, k=2)
        })

        # Step 3: Format answer
        formatter = RunnableLambda(lambda inputs: {
            "text": f"Base Knowledge: {self._format_documents(inputs['documents'])}\nUser Query: {inputs['refined_query']}"
        }) | self.llm_manager.get_summary_chain()

        # Final chain
        return refine_query | similarity_search | formatter
    
    def _format_documents(self, documents):
        """Format documents for the prompt."""
        return '\n\n'.join([doc.page_content for doc in documents])


class MongoDBAtlasQA:
    """Main QA system that orchestrates all components."""
    
    def __init__(self, mongo_uri, db_name, collection_name, embedding, index_name, llm, 
                 conversation_id: str = "test_session", user_id: str = "user1", 
                 history_limit: int = 2):
        """Initialize the MongoDB Atlas QA system."""
        try:
            # Initialize core components
            self._setup_mongodb_atlas(db_name, collection_name, embedding, index_name)
            self._setup_managers(llm, history_limit)
            self._setup_configuration(user_id, conversation_id)
            self._setup_chains()
            
        except Exception as e:
            print(f"Error initializing MongoDBAtlasQA: {e}")

    def _setup_mongodb_atlas(self, db_name, collection_name, embedding, index_name):
        """Setup MongoDB Atlas components."""
        self.atlas = MongoDBAtlas(db_name, collection_name)
        self.document_manager = MongoDBAtlasDocumentManager(atlas=self.atlas)  
        self.atlas.create_vector_store(
            embedding=embedding,
            index_name=index_name,
            relevance_score_fn="cosine",
        )

    def _setup_managers(self, llm, history_limit):
        """Setup all manager components."""
        self.llm_manager = LLMChainManager(llm)
        self.history_manager = ChatHistoryManager(history_limit)
        self.vector_manager = VectorSearchManager(self.atlas)
        self.agent_manager = AgentManager(self.llm_manager.get_no_prompt_chain(), self.vector_manager)

    def _setup_configuration(self, user_id, conversation_id):
        """Setup configuration for the system."""
        self.user_id = user_id
        self.conversation_id = conversation_id
        
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
        
        self.config = {"configurable": {"user_id": user_id, "conversation_id": conversation_id}}

    def _setup_chains(self):
        """Setup the chain builder and main chains."""
        self.chain_builder = ChainBuilder(
            self.llm_manager, 
            self.history_manager, 
            self.vector_manager, 
            self._config_fields
        )
        
        # Build the main QA chain
        self.full_chain = self.chain_builder.build_full_qa_chain(self.config)

    def run_llm_with_history(self, text: str) -> str:
        """Run the LLM with chat history."""
        try:
            history_chain = self.chain_builder.build_history_aware_chain(self.config)
            return history_chain.invoke({"query": text})
        except Exception as e:
            print(f"Error running LLM with history: {e}")
            return "Error processing your request."
        
    def run_query_mongo_react(self, text: str):
        """Query the knowledge base using ReAct agent."""
        try:
            agent = self.agent_manager.create_react_agent()
            return agent.invoke({"input": text})
        except Exception as e:
            print(f"Error querying the knowledge base: {e}")
            return None
    
    def format_answer(self, text: str, query: str) -> str:
        """Format and summarize the answer."""
        try:
            formatted_text = f"Base Knowledge: {text}\nUser Query: {query}"
            return self.llm_manager.get_summary_chain().invoke({"text": formatted_text})
        except Exception as e:
            print(f"Error formatting the answer: {e}")
            return "Error summarizing the answer."
        
    def run(self, text: str) -> str:
        """Run the MongoDB Atlas QA system."""
        try:
            result = self.full_chain.invoke({"query": text}, config=self.config)
            return result
        except Exception as e:
            print(f"Error running the MongoDB Atlas QA system: {e}")
            return "Error processing your request."


# Usage example:
# qa_system = MongoDBAtlasQA(
#     mongo_uri="your_uri",
#     db_name="your_db", 
#     collection_name="your_collection",
#     embedding=your_embedding,
#     index_name="your_index",
#     llm=your_llm,
#     history_limit=5  # Only keep last 5 messages
# )