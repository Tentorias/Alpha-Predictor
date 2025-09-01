# scripts/diagnose_features.py

import joblib
import os
import sys

# Adiciona o diretório raiz do projeto ao sys.path para garantir o acesso ao data/model
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root_path)

def diagnose_features():
    """
    Carrega o modelo de ML e imprime a ordem exata das features esperadas.
    """
    try:
        # Carrega o seu modelo treinado
        # ATENÇÃO: Altere o nome do arquivo para o nome do seu modelo
        model_filename = "alpha_predictor_model_tuned.pkl"  
        model_path = os.path.join(root_path, "data", "model", model_filename)
        
        if not os.path.exists(model_path):
            print(f"Erro: Arquivo do modelo '{model_filename}' não encontrado em: {model_path}")
            return
            
        model = joblib.load(model_path)
        
        # A maioria dos modelos do scikit-learn tem a lista de features no atributo 'feature_names_in_'
        # No entanto, se for uma pipeline, pode ser necessário um tratamento diferente.
        if hasattr(model, 'feature_names_in_'):
            feature_names = model.feature_names_in_.tolist()
            print("\n-----------------------------------------------------")
            print("ORDEM EXATA DAS FEATURES QUE O MODELO ESPERA:")
            print(feature_names)
            print("-----------------------------------------------------")
            print("\nCopie a lista acima para o arquivo 'scripts/feature_order.py'.")
        else:
            print("Erro: O modelo não tem o atributo 'feature_names_in_'. Verifique a documentação do seu modelo.")

    except Exception as e:
        print(f"Ocorreu um erro ao carregar o modelo ou obter as features: {e}")

if __name__ == "__main__":
    diagnose_features()