# backend/app/main.py

from fastapi import FastAPI, HTTPException
from datetime import date, timedelta
from functools import lru_cache

import yfinance as yf
import pandas as pd
import os
import sys

# Define project root
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(BASE_DIR)

# Internal imports
from scripts.feature_order import FEATURE_COLUMNS_ORDER
from src.pipeline.feature_engineer import create_features
from src.pipeline.model_predict import load_model

# Load model once on startup
MODEL_PATH = os.path.join(BASE_DIR, "data", "model", "alpha_predictor_model_tuned.pkl")
MODEL = load_model(MODEL_PATH)

app = FastAPI()

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
        
        if df_features.empty:
            raise HTTPException(status_code=400, detail="Could not create enough features for prediction.")

        # Reorders and prepares data for the model
        latest_data = df_features[FEATURE_COLUMNS_ORDER].iloc[-1].to_frame().T
        latest_data = latest_data.fillna(0)

        # Makes a prediction using the pre-loaded model
        prediction = MODEL.predict(latest_data)
        return {"ticker": ticker, "prediction": int(prediction[0])}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")