import requests
import os
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import numpy as np
from stock_data_analyser import StockDataAnalyser


def initiator():
    stock_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
    
    # stock_symbols = ["AAPL"]
    
    for stock_symbol in stock_symbols:
        
        analyser = StockDataAnalyser(stock_symbol)
        stock_data = analyser.fetch_and_plot_stock_data()
    
    

if __name__ == "__main__":
    initiator()