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

class StockDataAnalyser:
    """
    Class for analysing stock data
    """
    def __init__(self, stock_symbol):
        self.stock_symbol = stock_symbol
        timestamp = datetime.datetime.now().strftime("%Y%m%d")
        self.logger = CustomLogger("StockDataAnalyser", log_file=f'./ML/src/Logs/stock_data_analyser/{timestamp}.log').get_logger()
        
    def fetch_and_plot_stock_data(self):
        try:
            
            self.logger.info(f"Fetching stock data for {self.stock_symbol}...")
            
            try:
                scraper = StockDataScraper(self.stock_symbol, logger=self.logger)
                historical_data = scraper.getStockData()
            except Exception as e:
                raise_custom_exception(ScraperError, message=f"Failed to create StockDataScraper object for {self.stock_symbol}: {e}")

            
            historical_data = self.get_bollinger_bands(historical_data)
            
            for i in range(1, 20):
                historical_data[f'Close_Lag{i}'] = historical_data['Close'].shift(i)
            
            historical_data.drop(historical_data.head(20).index, inplace=True)
            
            # self.plot_stock_data(historical_data)
            
            historical_data.to_csv(f'{self.stock_symbol}_data.csv')
            self.logger.info(f"Saved stock data to CSV file: {self.stock_symbol}_data.csv")
            
            return historical_data
        
        except CustomException as e:
            self.logger.error(f"A custom error occurred at StockDataAnalayser->fetch_and_plot_stock_data: {e}")
            return None
        except Exception as e:
            self.logger.error(f"An error occurred at StockDataAnalayser->fetch_and_plot_stock_data: {e}")
            return None
    
    def getSeasonalDecomposition(self, stock_data):
        """
        Perform seasonal decomposition on stock data.
        """
        result = seasonal_decompose(stock_data['Close'], model='additive', period=1)
        return result
    
    

    def get_bollinger_bands(self,data, bollinger_window=20):
        """
        Calculate Bollinger Bands for a given stock data.
        """
        rolling_mean = data['Close'].rolling(window=bollinger_window).mean()
        rolling_std = data['Close'].rolling(window=bollinger_window).std()
        data['Bollinger_Upper'] = rolling_mean + (2 * rolling_std)
        data['Bollinger_Lower'] = rolling_mean - (2 * rolling_std)
        return data

    def plot_stock_data(self, data):
        """
        Plot stock data with Bollinger Bands.
        """
        plt.figure(figsize=(12, 6))
        plt.plot(data['Close'], label='Close Price', color='blue')
        plt.plot(data['Bollinger_Upper'], label='Bollinger Upper Band', color='red')
        plt.plot(data['Bollinger_Lower'], label='Bollinger Lower Band', color='green')
        plt.title(f'{self.stock_symbol} Bollinger Bands')
        plt.xlabel('Date')
        plt.ylabel('Price')
        plt.legend()
        plt.grid(True)
        plt.tight_layout()
        plt.show()