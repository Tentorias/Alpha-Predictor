# test_model.py

import joblib
import pandas as pd
import os

def test_model():
    # Caminho do diretório raiz do projeto
    # Navega para a pasta pai (..) do diretório atual (scripts)
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Substitua pelo nome do seu arquivo .pkl
    model_filename = 'alpha_predictor_model_tuned.pkl'
    
    # Caminho completo para o arquivo .pkl
    model_path = os.path.join(root_dir, 'data', 'model', model_filename)

    try:
        # Carrega o modelo
        model = joblib.load(model_path)
        print("Modelo carregado com sucesso.")

        # Cria dados de teste com as colunas na ordem correta
        # Use a ordem exata que você me forneceu.
        test_data = pd.DataFrame({
            'Close': [13.0],
            'Volume': [150000000.0],
            'Daily_Return': [0.015],
            'SMA_5': [12.8],
            'SMA_10': [12.5],
            'SMA_20': [12.2],
            'RSI': [65.5],
            'MACD': [0.3]
        })

        # Garante que os dados de teste estão na ordem correta
        # Este passo é crucial, assim como na API
        feature_order = ['Close', 'Volume', 'Daily_Return', 'SMA_5', 'SMA_10', 'SMA_20', 'RSI', 'MACD']
        test_data = test_data[feature_order]

        # Faz a previsão
        prediction = model.predict(test_data)
        
        print(f"Previsão do modelo: {prediction[0]}")
        print(f"Resultado: {'Preço sobe' if prediction[0] == 1 else 'Preço desce'}")

    except FileNotFoundError:
        print(f"Erro: O arquivo do modelo não foi encontrado em: {model_path}")
    except Exception as e:
        print(f"Ocorreu um erro ao carregar ou testar o modelo: {e}")

if __name__ == "__main__":
    test_model()