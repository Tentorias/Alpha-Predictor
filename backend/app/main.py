# backend/app/main.py

from fastapi import FastAPI, HTTPException
from datetime import date, timedelta
from functools import lru_cache
from fastapi.middleware.cors import CORSMiddleware

import numpy as np
import yfinance as yf
import os
import sys

# Define project root
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(BASE_DIR)

# Internal imports
from scripts.feature_order import FEATURE_COLUMNS_ORDER
from src.pipeline.feature_engineer import create_features
from src.pipeline.model_predict import load_model

app = FastAPI()

# Add middleware CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@lru_cache(maxsize=32)
def fetch_stock_data(ticker: str):
    # Fetches stock data from YFinance with caching
    end_date = date.today()
    start_date = end_date - timedelta(days=365)
    try:
        data = yf.download(f"{ticker}.SA", start=start_date, end=end_date)
        if data.empty:
            raise HTTPException(status_code=404, detail=f"Data for stock '{ticker}' not found.")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data from yfinance: {e}")

@app.get("/")
def read_root():
    # Base endpoint, returns a welcome message
    return {"message": "Welcome to the Stock Price Prediction API!"}

@app.get("/predict/{ticker}")
def predict_stock(ticker: str):
    # Main prediction endpoint, uses ML model
    try:
        df_data = fetch_stock_data(ticker)
        df_features = create_features(df_data)
        
        if df_features.empty or len(df_features) < 20: 
            raise HTTPException(status_code=400, detail="Could not create enough features for prediction.")

        # Reorders and prepares the most recent data row for the model
        latest_data = df_features[FEATURE_COLUMNS_ORDER].iloc[-1].to_frame().T
        
        # Loads the single, universal ML model
        model = load_model("alpha_predictor_model_tuned.pkl")

        # Makes a prediction
        prediction = model.predict(latest_data)
        return {"ticker": ticker, "prediction": int(prediction[0])}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")
    
@app.get("/data/{ticker}")
def get_historical_data(ticker: str):
    # Endpoint to get historical stock data
    try:
        df_data = fetch_stock_data(ticker)
        df_data_json = df_data.reset_index()
        
        df_chart_data = df_data_json[["Date", "Close"]]
        df_chart_data.columns = ["date", "close"]
        
        # Using .loc to avoid SettingWithCopyWarning
        df_chart_data.loc[:, "date"] = df_chart_data["date"].dt.strftime("%Y-%m-%d")
        
        return df_chart_data.to_dict(orient="records")
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")