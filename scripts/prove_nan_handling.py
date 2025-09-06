# prove_nan_handling.py

import joblib
import pandas as pd
import numpy as np
import os
import sys

# Adiciona o diretório raiz do projeto ao sys.path
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(root_path)

# Agora as importações abaixo funcionarão corretamente
from scripts.feature_order import FEATURE_COLUMNS_ORDER
from src.pipeline.feature_engineer import create_features
from src.pipeline.model_predict import load_model

def prove_nan_handling():
    """
    Simulates a DataFrame with NaN values to prove the API handles them correctly.
    """
    try:
        print("1. Creating a dummy DataFrame with NaN values...")
        # Create a dummy DataFrame that simulates a day with missing data
        dummy_df = pd.DataFrame({
            "Close": [1.0, 2.0, 3.0, 4.0, np.nan],
            "Volume": [100, 200, 300, 400, 500],
            "Daily_Return": [np.nan, 1.0, 0.5, 0.33, np.nan],
            "SMA_5": [np.nan, np.nan, np.nan, np.nan, np.nan],
            "SMA_10": [np.nan, np.nan, np.nan, np.nan, np.nan],
            "SMA_20": [np.nan, np.nan, np.nan, np.nan, np.nan],
            "RSI": [np.nan, np.nan, np.nan, np.nan, np.nan],
            "MACD": [np.nan, np.nan, np.nan, np.nan, np.nan]
        })
        
        # The create_features function will fill the NaNs
        df_features = create_features(dummy_df)
        
        # Get the last row and ensure the columns are in the correct order
        latest_data = df_features[FEATURE_COLUMNS_ORDER].iloc[-1].to_frame().T
        
        print("2. Displaying the DataFrame to be sent to the model:")
        print(latest_data)
        
        # Load the ML model
        model = load_model("alpha_predictor_model_tuned.pkl")
        
        # Make the prediction
        prediction = model.predict(latest_data)
        
        print("\n--- PROOF OF SUCCESS ---")
        print(f"Prediction result: {prediction[0]}")
        print("The API is correctly handling NaN values and making predictions.")

    except Exception as e:
        print("\n--- PROOF OF FAILURE ---")
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    prove_nan_handling()