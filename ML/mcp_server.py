from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from NNmodel import StockPriceNN
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
import psutil
import time
from lru_cache import LRUCache
from mcp.server.fastmcp import FastMCP
from stock_data_analyser import StockDataAnalyser
mcp=FastMCP("MCP server for Stock Price Prediction API")

@mcp.tool(name="get_stock_analysis", description="Get stock analysis")
def get_stock_analysis(stock_symbol: str):
    """
    Get stock analysis

    Args:
        stock_symbol (str): Stock symbol of the stock to analyze

    Returns:
        dict: A dictionary containing the stock symbol and a dictionary of
        analysis results.
    """
    try:
        sda=StockDataAnalyser(stock_symbol=stock_symbol)
        df=sda.getAnalysis()
        return {
            "stock_symbol": stock_symbol,
            "analysis": df.to_dict()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ =="__main__":
    print("Starting MCP Server....")
    mcp.run(transport="stdio")