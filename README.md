# Alpha Predictor: Inteligência Artificial para Previsão de Direção de Ativos (B3) 📈

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

Este é um projeto de portfólio em Data Science e Engenharia de Software voltado para o mercado financeiro. O objetivo principal é **prever o movimento de preços no dia seguinte** para ações da B3 (como `PETR4` e `VALE3`), utilizando dados históricos, indicadores de análise técnica e algoritmos de Machine Learning.

O ecossistema é composto por um **pipeline de Machine Learning**, um **backend robusto em FastAPI** e um **frontend responsivo em React**.

---

## 🚀 Como Executar o Projeto (Production-Ready)

O projeto foi totalmente containerizado com Docker, garantindo portabilidade, isolamento de dependências e resiliência das aplicações. O setup é ideal para ambientes de desenvolvimento e está configurado com políticas de reinício automático para simular um ambiente de produção.

### Pré-requisitos
* [Docker](https://docs.docker.com/get-docker/) instalado.
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) rodando com suporte ao WSL 2.

### Inicialização em Um Comando
Para subir todo o ecossistema (backend e frontend de forma integrada), execute na raiz do projeto:

```bash
docker compose up --build
```

Após o término da compilação dos containers, os serviços estarão acessíveis nas seguintes portas:
* **Frontend (React App):** [http://localhost:3000](http://localhost:3000)
* **Backend API (FastAPI + Swagger Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)

Você pode verificar a orquestração dos serviços no arquivo [docker-compose.yml](file:///c:/Users/mathe/Alpha-Predictor/docker-compose.yml).

*Para parar os serviços executando em segundo plano:* `docker compose down`

---

## 🛠️ Decisões de Arquitetura e Engenharia (Refatoração)

O backend do projeto passou por uma refatoração estratégica focada em desempenho e confiabilidade no serviço de inferência em tempo real. As seguintes decisões técnicas foram tomadas:

### 1. Inicialização Otimizada com FastAPI Lifespan ( RAM Cache )
Carregar modelos de Machine Learning pesados a cada requisição HTTP gera um gargalo crítico de I/O em disco e aumenta absurdamente o tempo de resposta da API (latência).
* **Solução:** Implementação do padrão `lifespan` do FastAPI para ler o arquivo serializado `.pkl` do disco e carregá-lo na memória RAM **apenas uma vez** durante o startup do servidor.
* **Impacto:** O modelo fica pré-carregado no estado global da aplicação, permitindo inferências instantâneas sub-milissegundo para os usuários.

Snippet do [main.py](file:///c:/Users/mathe/Alpha-Predictor/backend/app/main.py):
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Carrega o modelo de Machine Learning na RAM apenas uma vez no startup do servidor
    app.state.model = load_model("alpha_predictor_model_tuned.pkl")
    yield
```

### 2. Tratamento Robusto de Séries Temporais (Imputação de NaNs)
Indicadores técnicos calculados a partir de médias móveis (como SMA, RSI e MACD) naturalmente geram valores nulos (`NaN`) nos primeiros períodos da série temporal (janelas iniciais). A presença desses valores nulos causa falhas silenciosas ou exceções de inferência nos classificadores de Machine Learning (como Random Forest e XGBoost).
* **Solução:** Implementação de uma estratégia sequencial de imputação com preenchimento para a frente (`ffill()`) seguido de preenchimento para trás (`bfill()`) no pipeline de dados.
* **Impacto:** Garante que o vetor de features enviado para o modelo esteja 100% preenchido e matematicamente válido sem descartar dados úteis de janelas recentes.

Snippet do [feature_engineer.py](file:///c:/Users/mathe/Alpha-Predictor/src/pipeline/feature_engineer.py):
```python
# Trata valores nulos para séries temporais (forward-fill depois backward-fill)
df_processed = df_processed.ffill().bfill()
```

### 3. Caching Inteligente de Requisições Externas (`lru_cache`)
Consultar a API do Yahoo Finance (`yfinance`) a cada requisição web degrada a experiência do usuário devido à latência da rede e expõe o servidor ao risco de bloqueio por rate limiting.
* **Solução:** Cache temporário na memória local para até 32 requisições de tickers ativos.
* **Impacto:** Respostas instantâneas para requisições repetidas do mesmo ativo dentro da mesma janela temporal.

---

## 📊 Performance e Resultados dos Modelos

Vários experimentos de modelagem foram executados e salvos na pasta [data/model](file:///c:/Users/mathe/Alpha-Predictor/data/model). A tabela a seguir compara o desempenho das implementações testadas:

| Modelo | Acurácia (Accuracy) | Precisão (Precision) | Recall | F1-Score | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Puro / Baseline)** | **53.45%** | **49.39%** | **48.22%** | **48.80%** | **Melhor Desempenho** |
| Random Forest (Tuned) | 52.00% | 47.77% | 46.64% | 47.20% | Produção ([main.py](file:///c:/Users/mathe/Alpha-Predictor/backend/app/main.py)) |
| XGBoost (Tuned / Otimizado) | 48.73% | 45.18% | 53.75% | 49.10% | Testado |
| Random Forest (Baseline) | 47.11% | 46.18% | 66.95% | 54.66% | Baseline |

---

## 🧠 Aprendizados Reais: Acurácia vs. Hipótese do Mercado Eficiente

Um dos maiores indícios de maturidade em engenharia de dados aplicada a finanças é o entendimento da natureza estocástica do mercado.

### Por que uma acurácia de ~52% a 53% é realista?
De acordo com a **Hipótese do Mercado Eficiente (HME)**, os preços dos ativos refletem instantaneamente todas as informações disponíveis. Tentar prever a direção do preço futuro usando apenas indicadores de análise técnica baseados em preços passados aproxima-se de uma caminhada aleatória (*random walk*), onde o baseline lógico de acerto é 50%.
* **O Mito dos 90%:** Modelos que prometem acurácia acima de 70% ou 80% na previsão diária de ações no mercado spot quase sempre sofrem de **Data Leakage** (vazamento de dados, como normalizar o dataset completo antes da divisão de treino/teste ou usar variáveis defasadas incorretamente).
* **O Valor de 52%:** No universo quantitativo (Hedge Funds e trading sistemático), obter uma acurácia consistente de **52% a 53%** é altamente lucrativa. Essa pequena vantagem estatística (o "edge"), combinada com uma boa estratégia de gerenciamento de risco (ex: stop-loss, tamanho de posição adequado e taxas transacionais controladas), é suficiente para gerar Alpha a longo prazo.

### Próximos Passos para Melhorar o Modelo (Roadmap)
Para expandir o desempenho preditivo além das barreiras da análise técnica convencional, os próximos passos do roadmap técnico incluem:
1. **Inclusão de Dados Alternativos:** Integração de análise de sentimento em tempo real de notícias financeiras e redes sociais (usando LLMs ou NLP).
2. **Microestrutura de Mercado:** Uso de dados de Order Book (livro de ofertas), como desbalanço do fluxo de ordens (Order Imbalance) e volatilidade implícita de opções.
3. **Variáveis Macroeconômicas:** Incorporar curvas de juros (taxa SELIC), câmbio (USD/BRL), inflação (IPCA/IGP-M) e índices globais (S&P 500, VIX).
4. **Modelagem de Séries Temporais Avançada:** Substituir os classificadores estáticos por modelos sequenciais como redes LSTM, GRU ou arquiteturas Transformer baseadas em atenção temporal.

---

## 📁 Estrutura do Repositório

```
└── 📁Alpha-Predictor/
    ├── 📁backend/                   # API e Serviço de Inferência (FastAPI)
    │   ├── 📁app/
    │   │   ├── __init__.py
    │   │   └── main.py              # Inicialização de rotas e carregamento na RAM
    │   ├── 📁static/
    │   ├── .env
    │   ├── Dockerfile
    │   └── requirements.txt
    │
    ├── 📁data/                      # Base de Dados e Modelos Treinados
    │   ├── 📁model/                 # Modelos salvos (.pkl)
    │   │   ├── alpha_predictor_model.pkl            # Random Forest (Baseline)
    │   │   ├── alpha_predictor_model_tuned.pkl      # Random Forest (Tuned)
    │   │   └── alpha_predictor_model_tuned_xgb.pkl  # XGBoost (Tuned)
    │   ├── 📁processed/
    │   ├── 📁raw/
    │   └── 📁results/
    │
    ├── 📁frontend/                  # Interface do Usuário (React)
    │   ├── 📁public/
    │   ├── 📁src/
    │   │   ├── App.css              # Identidade visual modo escuro
    │   │   └── App.jsx              # UI interativa integrada com Recharts
    │   ├── .env
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── 📁notebooks/                 # Análise Exploratória e Modelagem (Jupyter)
    │   ├── 1_data_collection_and_analysis.ipynb
    │   ├── 2_pre_processing.ipynb
    │   ├── 3_modeling_and_evaluation.ipynb
    │   └── ...
    │
    ├── 📁src/                       # Pipeline de Treinamento de ML
    │   ├── __init__.py
    │   ├── main.py
    │   └── pipeline/
    │       ├── __init__.py
    │       ├── data_loader.py
    │       ├── feature_engineer.py  # Pipeline de engenharia de features (imputação de NaNs)
    │       └── model_predict.py
    │
    ├── .gitignore
    └── docker-compose.yml           # Orquestração local em um comando
```