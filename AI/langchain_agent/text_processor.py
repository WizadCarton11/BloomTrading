from sentence_transformers import SentenceTransformer
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter, CharacterTextSplitter, TokenTextSplitter
)
from langchain.text_splitter import NLTKTextSplitter

class TextProcessor:
    def __init__(self, text, chunk_size=500, chunk_overlap=50, split_method="recursive"):
        self.text = text
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.split_method = split_method
        self.chunks = None
        self.embeddings = None
        self.embedding_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

    
    def split_text(self):
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
            
            self.chunks = splitter.split_text(self.text)
            return self.chunks
        except Exception as e:
            print(f"Error in text splitting: {e}")
            return None
    
    def generate_embeddings(self, batch_size=32, normalize=False):
        try:
            if self.chunks is None:
                raise ValueError("Text must be split before generating embeddings.")
            
            self.embeddings = self.embedding_model.encode(
                self.chunks, convert_to_tensor=True, batch_size=batch_size, normalize_embeddings=normalize
            )
            return self.embeddings
        except Exception as e:
            print(f"Error in generating embeddings: {e}")
            return None
