from mongodb_atlas import MongoDBAtlas, MongoDBAtlasDocumentManager
from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
from langchain_community.embeddings import HuggingFaceEmbeddings
from file_reader import FileReader
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter, CharacterTextSplitter, TokenTextSplitter
)
from langchain.text_splitter import NLTKTextSplitter

class MongoUploader:

    def __init__(self, db_name: str, collection_name: str, document_path: str, model_name: str="sentence-transformers/all-MiniLM-L6-v2",
                 vector_search_index: str="test_vector_index", split_method: str="recursive", chunk_size: int=500, chunk_overlap: int=50
                 ):
        self.db_name = db_name
        self.collection_name = collection_name
        self.vector_search_index = vector_search_index
        self.split_method = split_method
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.model_name = model_name
        self.document_path = document_path
        
        try:
            self.atlas = MongoDBAtlas(db_name, collection_name)
            self.document_manager = MongoDBAtlasDocumentManager(atlas=self.atlas)
            self.embedding = HuggingFaceEmbeddings(model_name=model_name)
            self._file_reader = FileReader(self.document_path)
        except Exception as e:
            print(f"Error initializing MongoUploader: {e}")
            self.atlas = None
            self.document_manager = None
            self.embedding = None
            self._file_reader = None

    def execute(self):
        """
        Executes the process of reading a document, creating a vector store, splitting
        the document into chunks, and uploading the processed documents to MongoDB.

        The method performs the following steps:
        1. Reads the document using a file reader.
        2. Initializes a vector store in MongoDB Atlas with the specified embeddings.
        3. Splits the document using a checkpoint-based condition.
        4. Further splits the document using a configured text splitter.
        5. Updates the metadata for each document chunk with a unique index.
        6. Uploads the processed document chunks to MongoDB and returns their IDs.

        Returns:
            List[str]: The IDs of the uploaded document chunks, or None if an error occurs.
        
        Raises:
            RuntimeError: If the file reader or text splitter is not properly initialized.
        """

        try:
            if not self._file_reader:
                raise RuntimeError("File reader is not initialized.")
            
            self.document = self._file_reader.read()
            self.atlas.create_vector_store(
                embedding=self.embedding,
                index_name=self.vector_search_index,
                relevance_score_fn="cosine"
            )
            self.docs_split_by_checkpoint = self.document_manager.split_documents(
                documents=self.document,
                split_condition=self._split_by_checkpoint, split_index_name="doc_index"
            )
            self.splitter = self._get_splitter()
            if not self.splitter:
                raise RuntimeError("Splitter initialization failed.")
            
            self.docs_split_by_splitter = self.document_manager.split_documents_by_splitter(
                self.splitter, self.docs_split_by_checkpoint
            )
            for index, doc in enumerate(self.docs_split_by_splitter):
                doc.metadata.update({"chunk_index": index})
            print(self.docs_split_by_splitter)
            
            ids = self.atlas.add_documents(
                documents=self.docs_split_by_splitter
            )
            return ids
        except Exception as e:
            print(f"Error during execution: {e}")
            return None

    def _split_by_checkpoint(self, text: str) -> List[str]:
        """
        Splits the provided text into chapters based on a checkpoint marker.

        The function identifies segments within the text that are separated 
        by the string "[ CHECKPOINT" and further cleans up each segment by 
        removing any leading characters up to and including the next " ]" 
        marker, returning only the stripped content.

        Args:
            text (str): The text to be split into chapters.

        Returns:
            List[str]: A list of strings, where each string is a chapter 
                    extracted and cleaned from the original text. If an 
                    error occurs, an empty list is returned.
        """

        try:
            chapters = text.split("[ CHECKPOINT")
            return [chapter.split(" ]", 1)[-1].strip() for chapter in chapters]
        except Exception as e:
            print(f"Error in checkpoint splitting: {e}")
            return []
    
    def _get_splitter(self):
        """
        Initializes and returns a text splitter based on the specified splitting method.

        The function supports four types of splitting methods:
        - "recursive": Uses RecursiveCharacterTextSplitter with specified chunk size and overlap.
        - "character": Uses CharacterTextSplitter with specified chunk size and overlap.
        - "token": Uses TokenTextSplitter with specified chunk size.
        - "nltk": Uses NLTKTextSplitter with default settings.

        Returns:
            A text splitter object initialized with the appropriate settings, or None in case of an error.

        Raises:
            ValueError: If the split method is not one of the supported types.
        """

        try:
            if self.split_method == "recursive":
                splitter = RecursiveCharacterTextSplitter(
                    chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
                )
            elif self.split_method == "character":
                splitter = CharacterTextSplitter(
                    chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
                )
            elif self.split_method == "token":
                splitter = TokenTextSplitter(chunk_size=self.chunk_size)
            elif self.split_method == "nltk":
                splitter = NLTKTextSplitter()
            else:
                raise ValueError("Invalid split method. Choose from 'recursive', 'character', 'token', or 'nltk'.")
            return splitter
        except Exception as e:
            print(f"Error in text splitting: {e}")
            return None