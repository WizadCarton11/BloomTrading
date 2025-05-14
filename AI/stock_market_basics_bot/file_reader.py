import PyPDF2
import pandas as pd
from langchain_core.documents import Document
from typing import Iterable

class FileReader:
    def __init__(self, file_path):
        self.file_path = file_path
        self.content = None
    
    def read(self):
        """
        Reads a file and returns it as a list of Document objects.

        The format of the file is determined by the file extension:
        - .pdf: The file is read using PyPDF2 and the text is extracted.
        - .txt: The file is read as a text file and the content is extracted.
        - .csv: The file is read as a CSV file and the content is extracted.

        If the file format is not supported, a ValueError is raised.

        Returns:
            List of Document objects.
        """
        if self.file_path.endswith(".pdf"):
            self.content = self._read_pdf()
        elif self.file_path.endswith(".txt"):
            self.content = self._read_txt()
        elif self.file_path.endswith(".csv"):
            self.content = self._read_csv()
        else:
            raise ValueError("Unsupported file format")
        self.content= [Document(
            page_content=self.content,
            metadata={"source": self.file_path}
        )]
        return self.content
    
    def _read_pdf(self):
        """
        Extracts text content from a PDF file.

        Opens the PDF file specified by the file path in binary mode, reads
        its contents using PyPDF2, and concatenates the extracted text from
        each page into a single string.

        Returns:
            str: The extracted text with leading and trailing whitespace removed.
        """

        text = ""
        with open(self.file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    
    def _read_txt(self):
        """
        Reads the content of a text file.

        Opens the file specified by the file path in text mode with UTF-8
        encoding, reads its contents, and returns the extracted text with
        leading and trailing whitespace removed.

        Returns:
            str: The extracted text.
        """
        with open(self.file_path, "r", encoding="utf-8") as file:
            return file.read().strip()
    
    def _read_csv(self):
        """
        Reads the content of a CSV file.

        Opens the file specified by the file path using pandas, reads its contents into a DataFrame,
        and returns the DataFrame's string representation without the index.

        Returns:
            str: The string representation of the DataFrame without index.
        """

        df = pd.read_csv(self.file_path)
        return df.to_string(index=False)
