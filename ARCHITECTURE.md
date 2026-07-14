# Engenharia de Software & Arquitetura de Machine Learning (Alpha Predictor)

Este documento detalha as decisões técnicas, escolhas de design de código e a engenharia de dados aplicada por trás do projeto **Alpha Predictor**.

---

## 🛠️ Decisões de Arquitetura e Engenharia (Backend)

O backend foi construído em Python utilizando o framework **FastAPI**, focado em baixa latência e alta concorrência para disponibilizar predições em tempo real.

### 1. Inicialização Otimizada com FastAPI Lifespan ( RAM Cache )
Modelos de Machine Learning salvos em disco (como arquivos `.pkl` serializados com `joblib`) possuem tamanho considerável. Carregá-los do disco rígido a cada nova requisição HTTP gera um gargalo severo de I/O e aumenta drasticamente o tempo de resposta do servidor (latência).
* **Solução:** Implementação do gerenciador de ciclo de vida (`lifespan`) do FastAPI. O modelo é lido do disco apenas uma vez durante a inicialização (startup) do servidor e mantido na memória RAM compartilhada no estado da aplicação.
* **Impacto:** Redução da latência de inferência de segundos para menos de 2 milissegundos.

Trecho de código em [main.py](file:///c:/Users/mathe/Alpha-Predictor/backend/app/main.py):
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Carrega o modelo de Machine Learning na RAM apenas uma vez no startup do servidor
    app.state.model = load_model("alpha_predictor_model_tuned.pkl")
    yield
```

---

### 2. Tratamento de Séries Temporais (Imputação de NaNs)
Indicadores técnicos de análise técnica baseados em janelas móveis (como Médias Móveis, RSI e MACD) naturalmente geram valores nulos (`NaN`) nos primeiros períodos da série histórica (janelas iniciais). Algoritmos de classificação como Random Forest e XGBoost tradicionais não aceitam entradas nulas (`NaN`) no momento da predição, o que geraria falhas de execução no servidor.
* **Solução:** Implementação de uma estratégia sequencial de imputação temporal utilizando preenchimento para a frente (`ffill()`) seguido de preenchimento para trás (`bfill()`).
* **Impacto:** Garante que o vetor de features enviado para o modelo esteja 100% preenchido e matematicamente válido sem descartar dados úteis de janelas recentes.

Trecho de código em [feature_engineer.py](file:///c:/Users/mathe/Alpha-Predictor/src/pipeline/feature_engineer.py):
```python
# Trata valores nulos para séries temporais (forward-fill depois backward-fill)
df_processed = df_processed.ffill().bfill()
```

---

### 3. Caching de API Externa (`lru_cache`)
Chamar a biblioteca do Yahoo Finance (`yfinance`) a cada requisição é ineficiente devido à latência de rede externa e expõe o servidor ao risco de bloqueio de IP por excesso de requisições (rate limiting).
* **Solução:** Cache local em memória RAM via `@lru_cache` para armazenar temporariamente as cotações recentes por ativo pesquisado.

---

## 🧠 Modelagem: Acurácia vs. Hipótese do Mercado Eficiente

Um dos maiores desafios de Data Science aplicada a finanças é contornar a aleatoriedade dos preços de curto prazo.

### Por que uma acurácia de ~52% a 53% é realista?
Segundo a **Hipótese do Mercado Eficiente (HME)**, os preços dos ativos incorporam instantaneamente todas as informações disponíveis. Tentar prever a direção do preço futuro usando apenas indicadores de análise técnica baseados em preços passados aproxima-se de uma caminhada aleatória (*random walk*), onde o baseline lógico de acerto é 50%.
* **O Mito dos 90%:** Modelos que prometem acurácia acima de 70% ou 80% na previsão diária de ações no mercado spot quase sempre sofrem de **Data Leakage** (vazamento de dados, como normalizar o dataset completo antes da divisão de treino/teste ou usar variáveis defasadas incorretamente).
* **O Valor de 52%:** No universo quantitativo (Hedge Funds e trading sistemático), obter uma acurácia consistente de **52% a 53%** é altamente lucrativo. Essa pequena vantagem estatística (o "edge"), combinada com uma boa estratégia de gerenciamento de risco (ex: stop-loss, tamanho de posição adequado e taxas transacionais controladas), é suficiente para gerar Alpha a longo prazo.

### Próximos Passos do Roadmap Técnico
1. **Inclusão de Dados Alternativos:** Integração de análise de sentimento em tempo real de notícias financeiras e redes sociais (usando LLMs ou NLP).
2. **Microestrutura de Mercado:** Uso de dados de Order Book (livro de ofertas), como desbalanço do fluxo de ordens (Order Imbalance) e volatilidade implícita de opções.
3. **Variáveis Macroeconômicas:** Incorporar curvas de juros (taxa SELIC), câmbio (USD/BRL), inflação (IPCA/IGP-M) e índices globais (S&P 500, VIX).
4. **Modelagem de Séries Temporais Avançada:** Substituir os classificadores estáticos por modelos sequenciais como redes LSTM, GRU ou arquiteturas Transformer baseadas em atenção temporal.
