# src/main.py

import os
import pandas as pd
from pipeline.data_loader import load_processed_data
from pipeline.feature_engineer import create_features
from pipeline.model_predict import load_model, make_predictions


def main():
    """
    Entry point of the prediction pipeline.
    """
    
    try:
        # 1. Load the processed data for prediction
        df_processed = load_processed_data()
        
        # 2. Separate the features (X) and the target variable (y)
        X = df_processed.drop("target", axis = 1)
        y = df_processed["target"]

        # 3. Load the trained model (here the script will look for the .pkl file)
        model =load_model()
        
        # 4. Make predictions using the loaded model and features (X)
        predictions = make_predictions(model, X)
        
        # 5. Add the predictions to the original DataFrame for analysis
        X["predictions"] = predictions
        
        print("\nPredictions completed. The first 5 predictions are:")
        print(X[['predictions']].head())
        
    except FileNotFoundError as e:
        print(f"Error: {e}")

    print("\nPipeline execution completed.")

if __name__ == "__main__":
    main()