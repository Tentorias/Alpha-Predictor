# diagnose_api.py

import joblib
import pandas as pd
import numpy as np
import os
import sys

# Diretório raiz do projeto
ROOT_PATH = os.path.abspath(os.path.dirname(__file__))

# Caminho absoluto do modelo
MODEL_PATH = os.path.join(ROOT_PATH, "data", "model", "alpha_predictor_model_tuned.pkl")

# Adiciona raiz ao sys.path para importações
sys.path.append(ROOT_PATH)

from scripts.feature_order import FEATURE_COLUMNS_ORDER
from src.pipeline.feature_engineer import create_features
from src.pipeline.model_predict import load_model
from backend.app.main import fetch_stock_data

# Carrega o modelo apenas uma vez
MODEL = load_model(MODEL_PATH)

def diagnose_api_logic(ticker: str):
    try:
        print("1. Buscando dados da API...")
        df_data = fetch_stock_data(ticker)
        print("   - Dados obtidos com sucesso.")
        
        print("2. Criando features...")
        df_features = create_features(df_data)
        if df_features.empty:
            print("   - ERRO: DataFrame de features está vazio. Dados insuficientes.")
            return
        print("   - Features criadas com sucesso.")

        print("3. Reordenando e preparando dados para o modelo...")
        latest_data = df_features[FEATURE_COLUMNS_ORDER].iloc[-1].to_frame().T

        # Preenche NAs com zero (ou outra estratégia que quiser)
        latest_data = latest_data.fillna(0)
        print("   - Dados preparados com sucesso.")

        print("4. Fazendo a previsão...")
        prediction = MODEL.predict(latest_data)
        print("   - Previsão realizada com sucesso.")
        
        print("\n--- SUCESSO! ---")
        print(f"Previsão final: {prediction[0]}")

    except Exception as e:
        print("\n--- ERRO CRÍTICO ---")
        print(f"A lógica da API falhou. O erro é: {e}")
        print("\n--- TRACEBACK DETALHADO ---")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    diagnose_api_logic("PETR4")
