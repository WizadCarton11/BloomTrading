import requests
import os
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose
from data_scraper import StockDataScraper
from custom_logger import CustomLogger
import datetime
from custom_exceptions import raise_custom_exception, ScraperError, CustomException

import requests
import os
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose
from data_scraper import StockDataScraper
from custom_logger import CustomLogger
import datetime
from custom_exceptions import raise_custom_exception, ScraperError, CustomException
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


        
    def fetch_from_db_and_analyze(self):
        try:
            self._fetch_from_sql()
            self.plot_stock_data(self.stock_data)
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockDataAnalayser->fetch_from_sql_and_analyze: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockDataAnalayser->fetch_from_sql_and_analyze: {e}")
            return None        

    def fetch_and_store_stock_data(self, mode='csv'):
        try:
            
            self.logger.info(f"Fetching stock data for {self.stock_symbol}...")
            
            try:
                scraper = StockDataScraper(stockSymbol=self.stock_symbol)
                historical_data = scraper.getStockData()
            except Exception as e:
                raise_custom_exception(ScraperError, message=f"Failed to create StockDataScraper object for {self.stock_symbol}: {e}")

            historical_data = self._get_bollinger_bands(historical_data)
            
            for i in range(1, 20):
                historical_data[f'Close_Lag{i}'] = historical_data['Close'].shift(i)
            
            historical_data.drop(historical_data.head(20).index, inplace=True)
            historical_data['Trend']=self.getSeasonalDecomposition(historical_data)
            historical_data['Stock_name']=self.stock_symbol
            
            self.stock_data = historical_data
            
            if mode=='sql':
                self._dump_into_sql()
                self.logger.info(f"Saved stock data to sql")
            else:
                historical_data.to_csv(f'./stock_data/{self.stock_symbol}_data.csv')
                self.logger.info(f"Saved stock data to CSV file: {self.stock_symbol}_data.csv")
            
            # For dev purposes only
            # historical_data.to_csv(f'./stock_data/{self.stock_symbol}_data.csv')
            # self.logger.info(f"Saved stock data to CSV file: {self.stock_symbol}_data.csv")
            
            return historical_data
        
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockDataAnalayser->fetch_and_plot_stock_data: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockDataAnalayser->fetch_and_plot_stock_data: {e}")
            return None

    def fetch_and_plot_stock_data(self):
        try:
            
            self.logger.info(f"Fetching stock data for {self.stock_symbol}...")
            
            try:
                scraper = StockDataScraper(stockSymbol=self.stock_symbol)
                historical_data = scraper.getStockData()
            except Exception as e:
                raise_custom_exception(ScraperError, message=f"Failed to create StockDataScraper object for {self.stock_symbol}: {e}")

            historical_data = self._get_bollinger_bands(historical_data)
            
            for i in range(1, 20):
                historical_data[f'Close_Lag{i}'] = historical_data['Close'].shift(i)
            
            historical_data.drop(historical_data.head(20).index, inplace=True)
            historical_data['Trend']=self.getSeasonalDecomposition(historical_data)
            historical_data['Stock_name']=self.stock_symbol
            historical_data['index'] = historical_data.index
            self.plot_stock_data(historical_data)
            self.stock_data = historical_data
            
            
            return historical_data
        
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockDataAnalayser->fetch_and_plot_stock_data: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockDataAnalayser->fetch_and_plot_stock_data: {e}")
            return None

    def _fetch_from_sql(self):
        try:
            db_url = os.getenv('POSTGRES_URI')

            # Create SQLAlchemy engine
            engine = create_engine(db_url)
            # print(f"SELECT * FROM {self.stock_symbol.lower()}")
            df=pd.read_sql(f"SELECT * FROM {self.stock_symbol.lower()}", engine)
            # print(df)
            # df.index=df['']
            self.stock_data=df

        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockDataAnalayser->_fetch_from_sql: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockDataAnalayser->_fetch_from_sql: {e}")
            return None

    def _dump_into_sql(self):
        try:
            db_url = os.getenv('POSTGRES_URI')

            # Create SQLAlchemy engine
            engine = create_engine(db_url)
            with engine.connect() as connection:
                result = connection.execute(
                    text(f"SELECT to_regclass('public.{self.stock_symbol.lower()}')")
                ).scalar()
                
                if result:  # If table exists
                    connection.execute(text(f"DELETE FROM public.{self.stock_symbol.lower()}"))
                    connection.commit()

            
            self.stock_data.to_sql(self.stock_symbol.lower(),engine, if_exists="replace", index=True)

        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockDataAnalayser->dump_into_sql: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockDataAnalayser->dump_into_sql: {e}")
            return None


    def getSeasonalDecomposition(self, stock_data):
        """
        Perform seasonal decomposition on stock data.
        """
        result = seasonal_decompose(stock_data['Close'], model='additive', period=25)
        return result.trend
    
    

    def _get_bollinger_bands(self,data, bollinger_window=20, short_window=20):
        """
        Calculate Bollinger Bands for a given stock data.
        """
        rolling_mean = data['Close'].rolling(window=bollinger_window).mean()
        rolling_std = data['Close'].rolling(window=bollinger_window).std()
        data['EMA'] = data['Close'].ewm(span=short_window, adjust=False).mean()
        data['Bollinger_Upper'] = rolling_mean + (2 * rolling_std)
        data['Bollinger_Lower'] = rolling_mean - (2 * rolling_std)
        return data

    def plot_stock_data(self, data):
        """
        Plot stock data with Bollinger Bands.
        """
        fig = go.Figure()

        # Add Close Price line
        fig.add_trace(go.Scatter(x=data['index'], y=data['Close'], mode='lines', name='Close Price', line=dict(color='blue')))

        # Add Bollinger Upper Band
        fig.add_trace(go.Scatter(x=data['index'], y=data['Bollinger_Upper'], mode='lines', name='Bollinger Upper Band', line=dict(color='red')))

        # Add Bollinger Lower Band
        fig.add_trace(go.Scatter(x=data['index'], y=data['Bollinger_Lower'], mode='lines', name='Bollinger Lower Band', line=dict(color='green')))

        # Add seasonal decomposition components
        fig.add_trace(go.Scatter(x=data['index'], y=data['EMA'], mode='lines', name='EMA', line=dict(color='orange')))
        # Customize layout
        fig.update_layout(
            title="Stock Price with Bollinger Bands",
            xaxis_title="Date",
            yaxis_title="Price",
            legend=dict(x=0, y=1),
            # xaxis=dict(rangeslider=dict(visible=True))  # Enables zooming and panning
        )

        # Show the figure
        fig.show()