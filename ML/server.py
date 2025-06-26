from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
# from NNmodel import StockPriceNN
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time
from lru_cache import LRUCache
from stock_data_analyser import StockDataAnalyser
import pandas as pd
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from threading import Thread, Event
from utils import simulate_stock_streaming

running_flag = Event()
worker_thread = None
app = FastAPI(title="Stock Price Prediction API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input models
class PredictionInput(BaseModel):
    stock_symbol: str
    features: List[List[float]]

class TrainingInput(BaseModel):
    stock_symbol: str
    epochs: Optional[int] = 200

# def model_eviction_callback(stock_symbol, model):
#     print(f"Evicting model for {stock_symbol}")
#     # TO DO: add any cleanup like closing sessions, releasing GPU memory, etc.

# model_cache = LRUCache(capacity=5, ttl=3600, on_evict=model_eviction_callback)

# def get_model(stock_symbol: str) -> StockPriceNN:
#     model = model_cache.get(stock_symbol)
#     if model is None:
#         model = StockPriceNN(stock_symbol=stock_symbol)
#         model.load_model()
#         model_cache.put(stock_symbol, model)
#     return model

# @app.post("/predict")
# async def predict(input_data: PredictionInput):
#     """Endpoint for making predictions."""
#     try:
#         model = get_model(input_data.stock_symbol)
#         features = np.array(input_data.features)
#         predictions = model.predict(features)
        
#         if predictions is None:
#             raise HTTPException(status_code=500, detail="Prediction failed")
        
#         return {
#             "predictions": predictions.tolist(),
#             "stock_symbol": input_data.stock_symbol
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/train")
# async def train(input_data: TrainingInput):
#     """Endpoint for training the model."""
#     try:
#         model = StockPriceNN(stock_symbol=input_data.stock_symbol)
#         model.preprocess()
#         model.train(epochs=input_data.epochs)
#         return {"message": f"Model trained successfully for {input_data.stock_symbol}"}
#     except Exception as e:
#         print(e)
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/evaluate/{stock_symbol}")
# async def evaluate(stock_symbol: str):
#     """Endpoint for evaluating the model."""
#     try:
#         model = get_model(stock_symbol)
#         loss_metrics = model.evaluate()
#         if loss_metrics is None:
#             raise HTTPException(status_code=500, detail="Evaluation failed")
#         return {
#             "stock_symbol": stock_symbol,
#             "loss_metrics": loss_metrics
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

scheduler= BackgroundScheduler()

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     scheduler.add_job(cron_job(), CronTrigger(hour=6, minute=30), id="daily_task", replace_existing=True)
#     scheduler.start()
    
    
#     yield  # ← App runs here

#     # Shutdown logic
#     scheduler.shutdown()
    
def cron_job():
    try:
        simulate_stock_streaming(flag= running_flag)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/start")
def start_stream():
    global worker_thread
    if not running_flag.is_set():
        running_flag.set()
        worker_thread = Thread(target=cron_job, daemon=True)
        worker_thread.start()
        return {"status": "streaming started"}
    return {"status": "already running"}

@app.post("/stop")
def stop_stream():
    running_flag.clear()
    return {"status": "streaming stopped"}

@app.get('/fetch_stock_data/{stock_symbol}')
async def get_stock_data(stock_symbol: str):
    try:
        sda=StockDataAnalyser(stock_symbol=stock_symbol)
        print(stock_symbol)
        sda.fetch_stock_data_and_store(mode='db')
        # df = sda.fetch_stock_data_from_sql()

        return {
            "message": f"Stock data for {stock_symbol} fetched and stored successfully.",
            "stock_symbol": stock_symbol,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/to_kafka/{stock_symbol}')
async def to_kafka(stock_symbol: str):
    try:
        sda=StockDataAnalyser(stock_symbol=stock_symbol)
        sda.upload_stock_data_to_kafka()
        return {
            "message": f"Stock data for {stock_symbol} sent to Kafka successfully.",
            "stock_symbol": stock_symbol,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/process_today_stock_data/{stock_symbol}')
async def process_today_stock_data(stock_symbol: str):
    try:
        sda=StockDataAnalyser(stock_symbol=stock_symbol)
        data=sda.generate_today_stock_data()
        return {
            "message": f"Stock data for {stock_symbol} processed successfully.",
            "stock_symbol": stock_symbol,
            # "data": data.to_dict()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/get_analysis/{stock_symbol}')
async def get_analysis(stock_symbol: str):
    try:
        sda=StockDataAnalyser(stock_symbol=stock_symbol)
        df=sda.get_stock_data()
        return {
            "stock_symbol": stock_symbol,
            "stock_data": df.to_dict()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


start_time = time.time()
@app.get("/health")
async def health_check():
    uptime_seconds = time.time() - start_time
    cpu_percent = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory()
    mem_percent = mem.percent
    disk = psutil.disk_usage('/')
    disk_percent = disk.percent

    return {
        "name": "Stock Price Prediction API",
        "status": "Healthy",
        "uptime_seconds": int(uptime_seconds),
        "cpu_percent": cpu_percent,
        "memory_percent": mem_percent,
        "disk_usage_percent": disk_percent,
        "num_cores": psutil.cpu_count(logical=True),
        "load_avg": psutil.getloadavg(),  # Unix only
    }


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)