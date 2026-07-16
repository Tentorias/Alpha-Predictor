# backend/app/main.py

from fastapi import FastAPI, HTTPException, Request
from datetime import date, timedelta
from functools import lru_cache
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

import numpy as np
import yfinance as yf
import pandas as pd
import os

# Internal imports
from scripts.feature_order import FEATURE_COLUMNS_ORDER
from src.pipeline.feature_engineer import create_features
from src.pipeline.model_predict import load_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Loads the single, universal ML model on startup
    app.state.model = load_model("alpha_predictor_model_tuned.pkl")
    yield

app = FastAPI(lifespan=lifespan)

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
def predict_stock(ticker: str, request: Request):
    # Main prediction endpoint, uses ML model
    try:
        df_data = fetch_stock_data(ticker)
        df_features = create_features(df_data)
        
        if df_features.empty or len(df_features) < 20: 
            raise HTTPException(status_code=400, detail="Could not create enough features for prediction.")

        # Reorders and prepares the most recent data row for the model
        latest_data = df_features[FEATURE_COLUMNS_ORDER].iloc[-1].to_frame().T
        
        # Get the model from application state (loaded via lifespan)
        model = request.app.state.model
        if model is None:
            raise HTTPException(status_code=500, detail="Model is not loaded.")

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
    
@app.get("/backtest/{ticker}")
def backtest_stock(ticker: str, request: Request):
    # Endpoint to simulate strategy backtesting
    try:
        df_data = fetch_stock_data(ticker)
        df_features = create_features(df_data)
        
        if df_features.empty or len(df_features) < 20: 
            raise HTTPException(status_code=400, detail="Could not create enough features for backtesting.")

        # Get the model from application state
        model = request.app.state.model
        if model is None:
            raise HTTPException(status_code=500, detail="Model is not loaded.")

        # Reorder features for the model and predict in batch
        df_features_subset = df_features[FEATURE_COLUMNS_ORDER]
        predictions = model.predict(df_features_subset)
        
        # Calculate returns
        df_backtest = pd.DataFrame(index=df_features.index)
        df_backtest['Daily_Return'] = df_features['Close'].pct_change().fillna(0)
        df_backtest['Prediction'] = predictions
        
        # Strategy return matches the asset return only if the prediction from the PREVIOUS day was 1
        df_backtest['Strategy_Return'] = df_backtest['Daily_Return'] * df_backtest['Prediction'].shift(1).fillna(0)
        
        # Calculate cumulative returns starting from R$ 1,000
        df_backtest['buy_and_hold'] = (1000.0 * (1.0 + df_backtest['Daily_Return']).cumprod()).round(2)
        df_backtest['strategy'] = (1000.0 * (1.0 + df_backtest['Strategy_Return']).cumprod()).round(2)
        
        # Date string formatting
        df_backtest['date'] = df_backtest.index.strftime('%Y-%m-%d')
        
        return df_backtest[['date', 'buy_and_hold', 'strategy']].to_dict(orient="records")

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error during backtesting: {e}")
    
@app.get("/model/metrics")
def get_model_metrics():
    # Endpoint to get static model training evaluation metrics (Explainable AI)
    return {
        "feature_importances": [
            {"name": "Retorno Diário", "value": 14.40},
            {"name": "MACD", "value": 13.34},
            {"name": "Volume de Negociação", "value": 13.18},
            {"name": "RSI (I.F.R.)", "value": 12.64},
            {"name": "Média Móvel (5 dias)", "value": 12.33},
            {"name": "Média Móvel (20 dias)", "value": 11.49},
            {"name": "Preço de Fechamento", "value": 11.47},
            {"name": "Média Móvel (10 dias)", "value": 11.11}
        ],
        "confusion_matrix": {
            "true_negative": 168,
            "false_positive": 129,
            "false_negative": 135,
            "true_positive": 118,
            "accuracy": 0.5200,
            "precision": 0.4777,
            "recall": 0.4664,
            "f1_score": 0.4720
        }
    }
