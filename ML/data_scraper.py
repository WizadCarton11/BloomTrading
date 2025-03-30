import yfinance as yf
from custom_exceptions import *
from custom_logger import CustomLogger
import requests
import os
class StockDataScraper:
    """
    Class for scraping stock data from internet
    """
    def __init__(self, stockSymbol, logger=None):
        self.stock_symbol = stockSymbol
        self.logger = logger

    
    def getStockData(self, period='5y'):
        try:
            try:
                self.logger.info(f"Fetching stock data for {self.stock_symbol}...")
                historical_data= self.yahoo_finance_data(period=period)
            except Exception as e:
                raise_custom_exception(ScraperError, message=f"Failed to fetch data for {self.stockSymbol}: {e}")

            historical_data.drop(['Dividends', 'Stock Splits'], axis=1, inplace=True)
            
            
            self.logger.info(f"Fetched stock data for {self.stock_symbol} successfully...")
            
            return historical_data
        except CustomException as e:
            self.logger.error(f"A custom error occurred StockDataScraper->getStockData: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred StockDataScraper->getStockData: {e}")
            return None
        
    def getStockInfo(self):
        try:
            return self.yahoo_finance_info()
        except Exception as e:
            raise CustomException(f"Failed to fetch stock info for {self.stock_symbol}: {e}")
        
    def yahoo_finance_data(self, period='5y'):
        try:
            stock = yf.Ticker(self.stock_symbol)
            historical_data = stock.history(period=period)
            return historical_data
        except Exception as e:
            raise CustomException(f"Failed to fetch data for {self.stock_symbol}: {e}")

    def yahoo_finance_info(self):
        try:
            stock = yf.Ticker(self.stock_symbol)
            return stock.info
        except Exception as e:
            raise CustomException(f"Failed to fetch stock info for {self.stock_symbol}: {e}")

    def yahoo_finance_news(self, period='1d'):
        try:
            stock = yf.Ticker(self.stock_symbol)
            news = stock.news(period=period)
            return news
        except Exception as e:
            raise CustomException(f"Failed to fetch news for {self.stock_symbol}: {e}")

    def alpha_vantage_data(self):
        try:
            url=f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={self.stock_symbol}&apikey={os.environ['ALPHA_VANTAGE_API_KEY']}"
            response = requests.get(url)
            data = response.json()
            return data
        except Exception as e:
            raise CustomException(f"Failed to fetch data for {self.stock_symbol}: {e}")
        
    def alpha_vantage_info(self):
        try:
            url=f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={self.stock_symbol}&apikey={os.environ['ALPHA_VANTAGE_API_KEY']}"
            response = requests.get(url)
            data = response.json()
            return data
        except Exception as e:
            raise CustomException(f"Failed to fetch stock info for {self.stock_symbol}: {e}")

    def alpha_vantage_news(self):
        try:
            url=f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={self.stock_symbol}&interval=5min&apikey={os.environ['ALPHA_VANTAGE_API_KEY']}"
            response = requests.get(url)
            data = response.json()
            return data
        except Exception as e:
            raise CustomException(f"Failed to fetch news for {self.stock_symbol}: {e}")
        