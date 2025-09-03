# Alpha Predictor: Uma Ferramenta de Análise Quantitativa

## Visão Geral do Projeto

Este projeto de portfólio em Data Science e Machine Learning tem como objetivo principal prever a direção do movimento de preços de ações da bolsa brasileira (B3), especificamente PETR4 e VALE3. A solução proposta utiliza dados históricos e indicadores técnicos para treinar um modelo de Machine Learning que classifica se o preço de fechamento de uma ação no dia seguinte será maior ou menor que o do dia atual.

O resultado é um modelo preditivo com um dashboard interativo no Power BI, que permite a análise visual dos resultados e a exploração dos dados.

## Metodologia

O projeto segue as principais etapas do ciclo de vida de um projeto de Machine Learning:

1.  **Coleta e Análise de Dados:**
    * **Fonte de Dados:** Utilizamos a biblioteca `yfinance` para coletar dados diários das ações PETR4.SA e VALE3.SA no período de 2015 a 2025.
    * **Análise Exploratória:** A análise inicial incluiu a verificação de valores ausentes, tipos de dados e visualizações da série temporal e distribuição de retornos, revelando a alta correlação entre os dois ativos.
2.  **Pré-processamento e Engenharia de Features:**
    * **Limpeza:** Os dados foram limpos para remover linhas com informações incompletas e garantir a consistência dos tipos de dados.
    * **Engenharia de Features:** Foram criados indicadores técnicos e estatísticos como Retorno Diário, Médias Móveis (SMA), RSI e MACD para serem usados como variáveis preditoras.
    * **Variável-Alvo:** A variável `target` (0 ou 1) foi criada para representar a direção do movimento do preço no dia seguinte.
3.  **Modelagem e Treinamento:**
    * **Divisão de Dados:** Os dados foram divididos de forma cronológica (80% treino, 20% teste) para evitar *data leakage* e simular um cenário real.
    * **Modelo:** Um `RandomForestClassifier` foi selecionado como o modelo de classificação.
4.  **Avaliação e Otimização:**
    * O desempenho do modelo foi avaliado com métricas como Acurácia, Precisão, Recall e F1-Score, além da análise da Matriz de Confusão.
    * Foram realizadas tentativas de otimização de hiperparâmetros (via Randomized Search) e de seleção de features para aprimorar o desempenho. No entanto, o modelo inicial (baseline) se mostrou o mais robusto e, portanto, foi escolhido como a versão final.

## Tecnologias Utilizadas

* **Linguagem de Programação:** Python
* **Bibliotecas:** `pandas`, `yfinance`, `pandas_ta`, `scikit-learn`, `matplotlib`, `seaborn`
* **Visualização e Dashboard:** Power BI
* **Versionamento:** Git e GitHub

## Estrutura do Repositório

O projeto está organizado da seguinte forma:

O projeto está organizado da seguinte forma:

```
└── 📁Alpha-Predictor/
    ├── 📁backend/                   # Backend com FastAPI
    │   ├── 📁app/
    │   │   ├── __init__.py
    │   │   └── main.py              # Lógica da API
    │   ├── 📁static/                # Arquivos estáticos (imagens, CSS)
    │   ├── .env                     # Variáveis de ambiente
    │   ├── Dockerfile               # Configuração do Docker para o backend
    │   └── requirements.txt         # Dependências Python (FastAPI, uvicorn, etc)
    │
    ├── 📁data/                      # Ativos de dados (intocados)
    │   ├── 📁model/                 # Modelos ML salvos (.pkl)
    │   │   └── alpha_predictor_model_baseline.pkl
    │   ├── 📁processed/
    │   │   └── combined_data.csv
    │   ├── 📁raw/
    │   │   ├── PETR4_raw.csv
    │   │   └── VALE3_raw.csv
    │   └── 📁results/
    │       └── model_predictions.csv
    │
    ├── 📁frontend/                  # Aplicação React
    │   ├── 📁public/
    │   ├── 📁src/
    │   │   ├── components/          # Componentes React (Botões, Gráficos)
    │   │   └── App.js               # Componente principal
    │   ├── .env                     # Variáveis de ambiente (API_URL)
    │   ├── Dockerfile               # Configuração do Docker para o frontend
    │   └── package.json             # Dependências Node.js
    │
    ├── 📁src/                       # Pipeline de ML (intocados)
    │   ├── __init__.py
    │   ├── main.py
    │   └── pipeline/
    │       ├── __init__.py
    │       ├── data_loader.py
    │       ├── feature_engineering.py
    │       └── model_predict.py
    │
    ├── .gitignore                   # Arquivos a serem ignorados pelo Git
    └── docker-compose.yml           # Orquestração com Docker
```

## Resultados do Modelo

Após a avaliação e as tentativas de otimização, o modelo final escolhido (o baseline) apresentou as seguintes métricas no conjunto de teste:

* Acurácia: **0.4711**
* Precisão: **0.4618**
* Recall: **0.6695**
* F1-Score: **0.5466**

Embora as métricas não superem o desempenho aleatório, elas servem como um importante *baseline* para o projeto, indicando a complexidade do problema de previsão de mercado e a necessidade de aprimoramentos futuros.

## Próximos Passos (Para o Futuro do Projeto)

* Construção de um dashboard interativo no Power BI para visualização dos resultados.
* Exploração de mais features (ex: dados de um índice de mercado, indicadores econômicos).
* Teste com outros modelos, como modelos de séries temporais (ARIMA, Prophet) ou redes neurais.


--- Optimized XGBoost Model Results ---

Accuracy: 0.4873

Precision: 0.4518

Recall: 0.5375

F1-Score: 0.4910



Confusion Matrix:

[[132 165]

 [117 136]]



Modelo com random forest: 



 Accuracy:  0.5200 

 Precision:  0.4777 

 Recall:  0.4664 

 F1-Score:  0.4720 



 Confusion Matrix: 

 [[168 129] 

  [135 118]] 



 modelo com xgboost (puro): 



 --- XGBoost Model Results --- 

 Accuracy: 0.5345 

 Precision: 0.4939 

 Recall: 0.4822 

 F1-Score: 0.4880 



 Confusion Matrix: 

 [[172 125] 

  [131 122]]

  alpha_predictor_env\Scripts\activate

  cd backend
uvicorn app.main:app --reload
python backend/app/main.py
python src/pipeline/feature_engineer.py