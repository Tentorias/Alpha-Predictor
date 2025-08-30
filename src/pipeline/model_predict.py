# src/pipeline/model_predict.py
    
import os
import joblib

def load_model(model_filename="alpha_predictor_model_tuned.pkl"):
    """
    Loads the trained model from the default path.
    """

    base_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    model_path = os.path.join(base_path, "data", "model", model_filename)
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}. Train the model first.")
    
    model = joblib.load(model_path)
    return model

def make_predictions(model, data):
    """
    Makes predictions using the loaded model and the provided data.
    """
    
    predictions = model.predict(data)
    return predictions

if __name__ == "__main__":
    try:
        model = load_model()
        print("Model loaded successfully.")
    except FileNotFoundError as e:
        print(e)