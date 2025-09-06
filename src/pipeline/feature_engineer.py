# src/pipeline/feature_engineer.py

import pandas as pd
import pandas_ta as ta
import numpy as np

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates technical indicators from a stock DataFrame.
    Returns all possible features, even if some indicators fail.
    """
    # If the input DataFrame is empty or lacks essential columns, return an empty DataFrame.
    required_cols = ['Close', 'Volume']
    if df.empty or not all(col in df.columns for col in required_cols):
        return pd.DataFrame()

    df_processed = df.copy()

    # Simple features
    df_processed["Daily_Return"] = df_processed["Close"].pct_change()
    df_processed["SMA_5"] = df_processed["Close"].rolling(5).mean()
    df_processed["SMA_10"] = df_processed["Close"].rolling(10).mean()
    df_processed["SMA_20"] = df_processed["Close"].rolling(20).mean()
    
    # Helper function to calculate technical indicators with exception handling.
    def safe_ta(func, series, default=np.nan):
        try:
            result = func(series)
            if result is None:
                return default
            return result
        except Exception:
            return default
        
    # RSI
    df_processed["RSI"] = safe_ta(ta.rsi, df_processed["Close"])
    
    # MACD
    df_processed["MACD"] = safe_ta(lambda s: ta.macd(s)["MACD_12_26_9"], df_processed["Close"])
    

    return df_processed