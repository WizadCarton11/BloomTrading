import yfinance as yf
from custom_exceptions import *
from custom_logger import CustomLogger
class StockDataScraper:
    """
    Class for scraping stock data from internet
    """
    def __init__(self, stockSymbol, logger):
        self.stock_symbol = stockSymbol
        self.logger = logger
    
    def getStockDataByYfin(self, period='5y'):
        try:
            try:
                stock = yf.Ticker(self.stock_symbol)
                historical_data = stock.history(period=period)
            except Exception as e:
                raise_custom_exception(ScraperError, message=f"Failed to fetch data for {self.stockSymbol}: {e}")

            historical_data.drop(['Dividends', 'Stock Splits'], axis=1, inplace=True)
            
            
            self.logger.info(f"Fetched stock data for {self.stock_symbol} successfully...")
            
            return historical_data
        except CustomException as e:
            self.logger.error(f"An error occurred: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred: {e}")
            return None


