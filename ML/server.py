from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from NNmodel import StockPriceNN
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time
from lru_cache import LRUCache
from stock_data_analyser import StockDataAnalyser

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

def model_eviction_callback(stock_symbol, model):
    print(f"Evicting model for {stock_symbol}")
    # TO DO: add any cleanup like closing sessions, releasing GPU memory, etc.

model_cache = LRUCache(capacity=5, ttl=3600, on_evict=model_eviction_callback)

def get_model(stock_symbol: str) -> StockPriceNN:
    model = model_cache.get(stock_symbol)
    if model is None:
        model = StockPriceNN(stock_symbol=stock_symbol)
        model.load_model()
        model_cache.put(stock_symbol, model)
    return model

@app.post("/predict")
async def predict(input_data: PredictionInput):
    """Endpoint for making predictions."""
    try:
        model = get_model(input_data.stock_symbol)
        features = np.array(input_data.features)
        predictions = model.predict(features)
        
        if predictions is None:
            raise HTTPException(status_code=500, detail="Prediction failed")
        
        return {
            "predictions": predictions.tolist(),
            "stock_symbol": input_data.stock_symbol
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train(input_data: TrainingInput):
    """Endpoint for training the model."""
    try:
        model = StockPriceNN(stock_symbol=input_data.stock_symbol)
        model.preprocess()
        model.train(epochs=input_data.epochs)
        return {"message": f"Model trained successfully for {input_data.stock_symbol}"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/evaluate/{stock_symbol}")
async def evaluate(stock_symbol: str):
    """Endpoint for evaluating the model."""
    try:
        model = get_model(stock_symbol)
        loss_metrics = model.evaluate()
        if loss_metrics is None:
            raise HTTPException(status_code=500, detail="Evaluation failed")
        return {
            "stock_symbol": stock_symbol,
            "loss_metrics": loss_metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/get_analysis/{stock_symbol}')
async def get_analysis(stock_symbol: str):
    try:
        sda=StockDataAnalyser(stock_symbol=stock_symbol)
        df=sda.getAnalysis()
        return {
            "stock_symbol": stock_symbol,
            "analysis": df.to_dict()}
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