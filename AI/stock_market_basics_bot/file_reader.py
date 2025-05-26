import PyPDF2
import pandas as pd
from langchain_core.documents import Document
from typing import Iterable
from langchain.text_splitter import RecursiveCharacterTextSplitter



class FileReader:
    def __init__(self, file_path):
        self.file_path = file_path
        self.content = None
    
    def read(self):
        if self.file_path.endswith(".pdf"):
            self.content = self._read_pdf()
        elif self.file_path.endswith(".txt"):
            self.content = self._read_txt()
        elif self.file_path.endswith(".csv"):
            self.content = self._read_csv()
        else:
            raise ValueError("Unsupported file format")
        # self.content= [Document(
        #     page_content=self.content,
        #     metadata={"source": self.file_path}
        # )]
        self.content = self._splitter()
        return self.content
    
    def _splitter(self):
        splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50
        )
        chunks = splitter.split_text(self.content)

        self.content = [
            Document(
                page_content=chunk,
                metadata={"source": self.file_path, "chunk": i}
            )
            for i, chunk in enumerate(chunks)
        ]
        return self.content
    
    def _read_pdf(self):
        text = ""
        with open(self.file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    
    def _read_txt(self):
        with open(self.file_path, "r", encoding="utf-8") as file:
            return file.read().strip()
    
    def _read_csv(self):
        df = pd.read_csv(self.file_path)
        return df.to_string(index=False)
