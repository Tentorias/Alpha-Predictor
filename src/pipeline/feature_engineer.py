# src/pipeline/feature_engineer.py

import pandas as pd
import pandas_ta as ta

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cria indicadores técnicos a partir de um DataFrame de ações.
    Retorna todas as features possíveis, mesmo que alguns indicadores falhem.
    """
    # Se o DataFrame de entrada estiver vazio ou sem colunas essenciais, retorna vazio
    required_cols = ['Close', 'Volume']
    if df.empty or not all(col in df.columns for col in required_cols):
        return pd.DataFrame()

    df_processed = df.copy()

    # Features simples
    df_processed["Daily_Return"] = df_processed["Close"].pct_change()
    df_processed["SMA_5"] = df_processed["Close"].rolling(5).mean()
    df_processed["SMA_10"] = df_processed["Close"].rolling(10).mean()
    df_processed["SMA_20"] = df_processed["Close"].rolling(20).mean()

    # RSI
    try:
        df_processed["RSI"] = ta.rsi(df_processed["Close"])
    except Exception:
        df_processed["RSI"] = pd.NA

    # MACD
    try:
        macd_result = ta.macd(df_processed["Close"])
        if macd_result is not None and "MACD_12_26_9" in macd_result:
            df_processed["MACD"] = macd_result["MACD_12_26_9"]
        else:
            df_processed["MACD"] = pd.NA
    except Exception:
        df_processed["MACD"] = pd.NA

    # Mantém linhas mesmo com NaNs; dropna só será feito depois se quiser
    # df_processed.dropna(inplace=True)

    return df_processed
