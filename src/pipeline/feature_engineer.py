# src/pipeline/feature_engineering.py

import pandas as pd
import pandas_ta as ta

def create_features(df):
    """
    Creates the technical indicators and the target variable in the DataFrame.

    Args:
    df(pd.DataFrame): Input DataFrame with price and volume data.

    Returns:
    pd.DataFrame: DataFrame with the new features and the target variable.
    """
    
    df_processed = df[["close", "volume"]].copy()
    
    # Feature Engeneering: Create technical indicators
    df_processed["Daily_Return"] = df_processed["close"].pct_change()
    df_processed["SMA_5"] = df_processed["close"].rolling(5).mean()
    df_processed["SMA_10"] = df_processed["close"].rolling(10).mean()
    df_processed["SMA_20"] = df_processed["close"].rolling(20).mean()
    df_processed["RSI"] = ta.rsi(df_processed["close"])
    
    macd_result = ta.macd(df_processed["Close"])
    df_processed["MACD"] = macd_result["MACD_12_26_9"]
    
    # Create the target variable
    df_processed["target"] = (df_processed["close"].shift(-1) > df_processed["close"].shift(-1) > df_processed["Close"]).astype(int)
    
    df_processed.dropna(inplace=True)
    
    return df_processed

if __name__ == "__main__":
    print("Module for feature engineering.")