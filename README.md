# Alpha Predictor: Uma Ferramenta de Análise Quantitativa

## Visão Geral do Projeto

Este projeto de portfólio em Data Science e Machine Learning tem como objetivo principal prever a direção do movimento de preços de ações da bolsa brasileira (B3), especificamente PETR4 e VALE3. A solução proposta utiliza dados históricos e indicadores técnicos para treinar um modelo de Machine Learning que classifica se o preço de fechamento de uma ação no dia seguinte será maior ou menor que o do dia atual.

O resultado é um modelo preditivo com um dashboard interativo no Power BI, que permite a análise visual dos resultados e a exploração dos dados.

## Metodologia

O projeto segue as principais etapas do ciclo de vida de um projeto de Machine Learning:

1.  **Coleta e Análise de Dados:**
    * **Fonte de Dados:** Utilizamos a biblioteca `yfinance` para coletar dados diários das ações PETR4.SA e VALE3.SA no período de 2015 a 2025.
    * **Análise Exploratória:** A análise inicial incluiu a verificação de valores ausentes, tipos de dados e visualizações da série temporal e distribuição de retornos.
2.  **Pré-processamento e Engenharia de Features:**
    * **Limpeza:** Os dados foram limpos para remover linhas com informações incompletas.
    * **Engenharia de Features:** Foram criados indicadores técnicos e estatísticos como Retorno Diário, Médias Móveis (SMA), RSI e MACD para serem usados como variáveis preditoras.
    * **Variável-Alvo:** A variável `target` (0 ou 1) foi criada para representar a direção do movimento do preço no dia seguinte.
3.  **Modelagem e Treinamento:**
    * **Divisão de Dados:** Os dados foram divididos de forma cronológica (80% treino, 20% teste) para evitar *data leakage* e simular um cenário real.
    * **Modelo:** Um `RandomForestClassifier` foi selecionado como o modelo de classificação.
4.  **Avaliação:**
    * O desempenho do modelo foi avaliado com métricas como Acurácia, Precisão, Recall e F1-Score, além da análise da Matriz de Confusão.
    * Os resultados iniciais indicam que o modelo serve como um bom *baseline*, mas pode ser aprimorado com a otimização de hiperparâmetros ou a exploração de outros modelos.

## Tecnologias Utilizadas

* **Linguagem de Programação:** Python
* **Bibliotecas:** `pandas`, `yfinance`, `pandas_ta`, `scikit-learn`, `matplotlib`, `seaborn`
* **Visualização e Dashboard:** Power BI
* **Versionamento:** Git e GitHub

## Estrutura do Repositório

O projeto está organizado da seguinte forma:

```
└── 📁Alpha-Predictor
    ├── 📁data
    │   ├── 📁processed
    │   │   └── combined_data.csv
    │   ├── 📁raw
    │   │   ├── PETR4_raw.csv
    │   │   └── VALE3_raw.csv
    │   └── 📁results
    │       └── model_predictions.csv
    ├── 📁notebooks
    │   ├── 01_coleta_e_analise_dados.ipynb
    │   ├── 02_pre_processamento.ipynb
    │   └── 03_modelagem_e_avaliacao.ipynb
    ├── 📁model
    │   └── alpha_predictor_model.pkl  <-- A nova pasta e o arquivo
    ├── 📁dashboards
    │   └── Alpha_Predictor_Dashboard.pbix
    ├── .gitignore
    ├── README.md
    └── requirements.txt
```

## Resultados do Modelo

Os resultados da avaliação no conjunto de teste são:
* Acurácia: [Inserir valor]
* Precisão: [Inserir valor]
* Recall: [Inserir valor]
* F1-Score: [Inserir valor]

## Próximos Passos

* Otimização dos hiperparâmetros do `RandomForestClassifier`.
* Exploração de outros modelos, como XGBoost e LightGBM.
* Inclusão de mais features (ex: indicadores econômicos globais).