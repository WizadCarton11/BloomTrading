import os
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose
from data_scraper import StockDataScraper
from custom_logger import CustomLogger
import datetime
from custom_exceptions import raise_custom_exception, ScraperError, CustomException
import os
import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose
from data_scraper import StockDataScraper
from custom_logger import CustomLogger
import datetime
from custom_exceptions import *
import plotly.graph_objects as go
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
load_dotenv()
class StockDataAnalyser:
    """
    Class for analysing stock data
    """
    def __init__(self, stock_symbol):
        self.stock_symbol: str = stock_symbol
        timestamp = datetime.datetime.now().strftime("%Y%m%d")
        self.logger = CustomLogger("StockDataAnalyser", log_file=f'./Logs/stock_data_analyser/{timestamp}.log').get_logger()
        self.stock_data=None
        self.processing_columns= ['open', 'high', 'low', 'close', 'volume']
        self.scraper = StockDataScraper(stockSymbol=self.stock_symbol)
        self.engine = create_engine(os.getenv('POSTGRES_URI'))


    def fetch_stock_data_and_store(self, mode: str='csv') -> pd.DataFrame:
        try:
            self.logger.info(f"Checking first if the table exists in the database...")
            table_exists: bool=self._check_if_table_exists(self.stock_symbol)
            if not table_exists:
                self.logger.info(f"Table does not exist in the database. Hence fetch full data from scraper.")
                df: pd.DataFrame=self.scraper.getStockData(compact=False)
            else:
                self.logger.info(f"Table exists in the database. Hence fetch compact data from scraper.")
                df: pd.DataFrame=self.scraper.getStockData(compact=True)
            df.columns = [col.lower() for col in df.columns]
            df['index'] = df.index
            self.logger.info(f"Fetched data from Alpha Vantage API.")
            self.logger.info(f"Fetching analysed data...")
            analysed_data: pd.DataFrame=self._get_analysed_data(df)
            self.logger.info(f"Fetched analysed data.")
            if mode == 'csv':
                self.logger.info(f"Saving data to CSV file...")
                analysed_data.to_csv(f'./stock_data/{self.stock_symbol}_data.csv')
                self.logger.info(f"Saved stock data to CSV file: {self.stock_symbol}_data.csv")
            elif mode == 'db':
                self.logger.info(f"Saving data to database...")
                if table_exists:
                    self.logger.info(f"Table exists in the database. Hence replacing the data.")
                    latest_data = self._sql_execute(query=f"SELECT * FROM {self.stock_symbol.lower()} ORDER BY index DESC LIMIT 1")
                    latest_data = latest_data.iloc[0]
                    analysed_data = analysed_data[analysed_data['index'] >= latest_data['index']]
                    if analysed_data.empty:
                        self.logger.info(f"No new data to insert into the database.")
                        return None
                    else:
                        analysed_data.to_sql(self.stock_symbol.lower(), self.engine, if_exists='append', index=True)
                else:
                    analysed_data.to_sql(self.stock_symbol.lower(), self.engine, if_exists='append', index=True)
                self.logger.info(f"Saved stock data to database: {self.stock_symbol}")
            else:
                raise_custom_exception(ScraperError, message=f"Invalid mode: {mode}. Use 'csv' or 'db'.")
            self.stock_data = analysed_data
            return analysed_data
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Error in StockDataAnalyser->fetch_stock_data_and_store: {e}")
            return None   

    def get_stock_data(self)-> pd.DataFrame:
        try:
            return self._sql_execute(query=f"Select * from {self.stock_symbol.lower()}")
        except Exception as e:
            raise_custom_exception(DatabaseError, message=f"Error in StockDataAnalyser->get_stock_data: {e}")

    def _check_if_table_exists(self, table_name: str) -> bool:
        """
        Check if a table exists in the database.
        """
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text(f"SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='{table_name.lower()}');"))
                exists = result.scalar()
            return exists
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Failed to check if table exists: {e}")
            return False

    def _sql_execute(self, query: str):
        """
        Execute a SQL query and return the result as a DataFrame.
        """
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text(query))
                df = pd.DataFrame(result.fetchall(), columns=result.keys())
            return df
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Failed to execute SQL query: {e}")
            return None
    
    def _get_analysed_data(self, stock_data: pd.DataFrame) -> pd.DataFrame:
        try:
            stock_data= self._getSeasonalDecomposition(stock_data)
            stock_data= stock_data[::-1].reset_index(drop=True)
            stock_data= self._get_bollinger_bands(stock_data)
            stock_data= stock_data[::-1].reset_index(drop=True)
            return stock_data
        except Exception as e:
            raise_custom_exception(ScraperError, message=f"Failed to get seasonal decomposition: {e}")
            return None

    def _getSeasonalDecomposition(self, stock_data: pd.DataFrame) -> pd.DataFrame:
        """
        Perform seasonal decomposition on stock data.
        """
        for col in self.processing_columns:
            result = seasonal_decompose(stock_data[col], model='additive', period=25)
            stock_data[f'{col}_Trend'] = result.trend
            stock_data[f'{col}_Seasonal'] = result.seasonal
            stock_data[f'{col}_Residual'] = result.resid
        return stock_data 
    
    def _get_bollinger_bands(self, data: pd.DataFrame, bollinger_window: int =20, short_window: int =20):
        """
        Calculate Bollinger Bands using previous N records in chronological order.
        Ensures Bollinger values exist for the latest dates (top of DataFrame).
        """
        
        for col in self.processing_columns:
            rolling_mean = data[col].rolling(window=bollinger_window).mean()
            rolling_std = data[col].rolling(window=bollinger_window).std()
            data[f'{col}_EMA'] = data[col].ewm(span=short_window, adjust=False).mean()
            data[f'{col}_Bollinger_Upper'] = rolling_mean + (2 * rolling_std)
            data[f'{col}_Bollinger_Lower'] = rolling_mean - (2 * rolling_std)

        return data