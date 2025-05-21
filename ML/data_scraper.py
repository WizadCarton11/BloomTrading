import yfinance as yf
from custom_exceptions import *
from custom_logger import CustomLogger
import requests
import os
# load env
from dotenv import load_dotenv
load_dotenv()
import datetime
import pandas as pd
class StockDataScraper:
    """
    Class for scraping stock data from internet
    """
    def __init__(self, stockSymbol):
        self.stock_symbol = stockSymbol
        timestamp = datetime.datetime.now().strftime("%Y%m%d")
        self.logger = CustomLogger("StockDataScraper", log_file=f'./Logs/stock_data_scraper/{timestamp}.log').get_logger()

        self.stock_data= None
        self.structured_stock_data= None
    
    def dumpIntoCSV(self):
        try: 
            df = pd.DataFrame.from_dict(self.stock_data['Time Series (Daily)'], orient='index')

            df.columns = ['Open', 'High', 'Low', 'Close', 'Volume']

            # only save upto 1200 rows
            df = df.iloc[:1000]
            # Convert the columns to numeric
            df = df.apply(pd.to_numeric) 
            self.structured_stock_data = df

            csv_path = os.path.join(os.getcwd(), 'stock_data', f'{self.stock_symbol}_data.csv')
            # Check if the directory exists, if not create it
            os.makedirs(os.path.dirname(csv_path), exist_ok=True)
            # Save the DataFrame to a CSV file
            df.to_csv(csv_path)

            self.logger.info(f"Data dumped into {csv_path} successfully...")
        except Exception as e:
            self.logger.error(f"Failed to dump data into CSV: {e}")
            raise CustomException(f"Failed to dump data into CSV: {e}")
    def getStockData(self, period='5y'):
        try:
            try:
                # print("entering")
                self.logger.info(f"Fetching stock data for {self.stock_symbol}...")
                
                # Yfinance is not working for some stocks, so we need to use Alpha Vantage
                # historical_data= self.yahoo_finance_data(period=period)

                # ALPHAVANTAGE API
                alpha_data = self.alpha_vantage_data()
                historical_data=pd.DataFrame.from_dict(self.stock_data['Time Series (Daily)'], orient='index')
                historical_data.columns = ['Open', 'High', 'Low', 'Close', 'Volume']
                historical_data=historical_data.iloc[:1000].apply(pd.to_numeric)
                # print(historical_data.size)
            except Exception as e:
                raise_custom_exception(ScraperError, message=f"Failed to fetch data for {self.stock_symbol}: {e}")

            # used with yfinance ONLY
            # historical_data.drop(['Dividends', 'Stock Splits'], axis=1, inplace=True)
            
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
            url=f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={self.stock_symbol}&apikey={os.environ['ALPHA_VANTAGE_API_KEY']}&outputsize=full&datatype=json"
            response = requests.get(url)
            data = response.json()
            self.stock_data = data
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
            # url=f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={self.stock_symbol}&interval=5min&apikey={os.environ['ALPHA_VANTAGE_API_KEY']}"
            url=f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers={self.stock_symbol}&apikey={os.environ['ALPHA_VANTAGE_API_KEY']}"
            response = requests.get(url)
            data = response.json()
            return data
        except Exception as e:
            raise CustomException(f"Failed to fetch news for {self.stock_symbol}: {e}")
        