# data_loader.py

import os
import pandas as pd

def load_processed_data(file_name="combined_data.csv"):
    """
    Loads the processed DataFrame from the default path.
    """
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    processed_data_path = os.path.join(base_path, 'data', 'processed', file_name)
    
    if not os.path.exists(processed_data_path):
        raise FileNotFoundError(f"File not found: {processed_data_path}. Run the preprocessing notebook.")
    
    df = pd.read_csv(processed_data_path, index_col="Date", parse_dates = True)
    
    return df

if __name__ == "__main__":
    try:
        df = load_processed_data()
        print("Data loaded successfully. First 5 lines:")
        print(df.head())
    except FileNotFoundError as e:
        print(e)
        
        
# python src/main.py