# Alpha Predictor: IA para Previsão de Ações (B3) 📈

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

Uma ferramenta interativa que utiliza **Inteligência Artificial** (Machine Learning) para prever a direção do movimento de fechamento (Alta ou Baixa) de ações da Bolsa brasileira (B3) para o dia seguinte (D+1).

Este é um projeto de portfólio completo que demonstra a integração de um pipeline de Data Science, uma API de alto desempenho em Python e um dashboard moderno em React, tudo empacotado em containers prontos para produção.

---

## 🖥️ Demonstração Visual

Aqui está uma prévia do sistema rodando com o painel gráfico interativo de ações e as predições geradas pela inteligência artificial:

### Visualização de Compra (PETR4 - Alta)
![Alpha Predictor - PETR4](docs/petr4_dashboard.png)

### Visualização de Venda (VALE3 - Baixa)
![Alpha Predictor - VALE3](docs/vale3_dashboard.png)

---

## ✨ Funcionalidades Principais

* **Predição Direcional de Ativos (D+1)**: Classificação estatística (XGBoost/Random Forest) informando a tendência para o próximo fechamento (ALTA ou BAIXA).
* **Gráfico de Cotação Histórica**: Gráfico interativo e dinâmico de linha (Recharts) mostrando o fechamento diário do último ano do ativo selecionado.
* **Consulta em Tempo Real**: Coleta de dados financeiros atualizados automaticamente via integração com Yahoo Finance.
* **Design Dark Moderno**: Interface responsiva e elegante com visual focado em plataformas de investimento profissionais (Glassmorphism).

---

## 🚀 Como Executar o Projeto em 1 Minuto (Docker)

Toda a infraestrutura do projeto (React Frontend e FastAPI Backend) foi containerizada. Você não precisa instalar Python, Node ou configurar variáveis locais.

### Pré-requisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto.

### Rodar a Aplicação
Abra o terminal na pasta raiz do projeto e execute:

```bash
docker compose up --build
```

Após a inicialização rápida, acesse no seu navegador:
* 🌐 **Interface Web (React):** [http://localhost:3000](http://localhost:3000)
* ⚙️ **Documentação da API (FastAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)

*(Para desligar os servidores, use o comando: `docker compose down`)*

---

## 📘 Detalhes Técnicos e Arquitetura

Se você é um desenvolvedor, líder técnico ou recrutador técnico e quer entender as decisões de engenharia por trás deste projeto (como cache em memória RAM, tratamento de nulos em séries temporais e performance dos modelos), acesse o documento completo:

👉 **[Ler Documento de Detalhes Técnicos (TECHNICAL.md)](TECHNICAL.md)**

---

## 📁 Estrutura Simplificada

```
└── 📁Alpha-Predictor/
    ├── 📁backend/         # API FastAPI & Configurações Docker
    ├── 📁frontend/        # Dashboard React (Vite, Recharts e CSS Moderno)
    ├── 📁notebooks/       # Jupyter Notebooks com análises de Data Science
    ├── 📁src/             # Código-fonte da pipeline de Machine Learning
    ├── docker-compose.yml # Orquestrador de infraestrutura
    └── TECHNICAL.md       # Explicações técnicas detalhadas das decisões do projeto
```