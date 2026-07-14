# Alpha Predictor: Inteligência Artificial para Ações da B3 📈

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

O **Alpha Predictor** é uma aplicação completa (Fullstack + IA) que utiliza algoritmos de Machine Learning para prever a direção do preço (Alta ou Baixa) de grandes ativos da B3 (como `PETR4` e `VALE3`) no dia seguinte.

Ele traz um **painel interativo moderno com tema escuro**, integrado a um backend rápido em FastAPI e modelos preditivos em Python.

---

## 🖥️ Demonstração Visual

Abaixo está o visual moderno do painel financeiro criado para o projeto. Ele possui carregamento rápido, gráficos interativos de linha de preços e badges inteligentes indicando a recomendação gerada pelo modelo de Inteligência Artificial:

*(Insira aqui um GIF animado ou imagem do painel financeiro rodando localmente)*

---

## 🚀 Como Executar o Projeto (Sem complicação)

O projeto está totalmente configurado para rodar em qualquer máquina usando **Docker**. Você não precisa instalar Python, Node.js ou configurar dependências manualmente.

### Pré-requisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto.

### Executar em 1 Comando
Abra o terminal na pasta raiz do projeto e execute:

```bash
docker compose up --build
```

Após os containers iniciarem, abra o seu navegador nas portas abaixo:
* 🌐 **Painel da Interface (Frontend):** [http://localhost:3000](http://localhost:3000)
* ⚙️ **Documentação da API (Backend Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

*Para parar a aplicação:* `docker compose down`

---

## 🏗️ Como o Projeto foi Construído

* **Frontend (Interface):** Desenvolvido em **React** com componentes interativos da biblioteca **Recharts** para desenhar os gráficos de cotação em tempo real e ícones da **Lucide React**. Servido em produção de forma ultraleve usando o servidor web **Nginx**.
* **Backend (API):** Desenvolvido em **FastAPI (Python)**, com foco em respostas sub-milissegundo para o usuário final.
* **Inteligência Artificial (IA/ML):** Modelagem preditiva usando algoritmos clássicos de mercado (**Random Forest** e **XGBoost**) alimentados por indicadores de análise técnica (RSI, MACD, Médias Móveis).

---

## 🔬 Detalhes Técnicos e Arquitetura

Para os desenvolvedores, engenheiros ou Tech Leads que desejam analisar o código em profundidade, o detalhamento das decisões difíceis de desenvolvimento de software e ciência de dados está no arquivo dedicado:

👉 **[Acesse a Documentação Técnica e Arquitetura aqui](file:///c:/Users/mathe/Alpha-Predictor/ARCHITECTURE.md)**

*Lá você encontrará explicações sobre:*
* Inicialização otimizada em RAM com FastAPI `lifespan`.
* Tratamento robusto contra erros matemáticos (imputação de dados nulos nas séries temporais).
* Discussão conceitual teórica sobre a Hipótese de Mercado Eficiente (HME) aplicada a IA.