import React, { useState } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  AlertTriangle, 
  Info, 
  BarChart3 
} from 'lucide-react';
import './App.css';

// Consuming Vite's environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [ticker, setTicker] = useState(null);       
  const [prediction, setPrediction] = useState(null); 
  const [chartData, setChartData] = useState([]);  
  const [loading, setLoading] = useState(false);   
  const [error, setError] = useState(null);        

  const handlePredict = async (selectedTicker) => {
    setTicker(selectedTicker);
    setLoading(true);
    setPrediction(null);
    setChartData([]);
    setError(null);

    try {
      const apiClient = axios.create({ timeout: 15000 }); // 15s timeout

      // Parallel request to backend
      const [predictionResponse, dataResponse] = await Promise.all([
        apiClient.get(`${API_URL}/predict/${selectedTicker}`),
        apiClient.get(`${API_URL}/data/${selectedTicker}`)
      ]);
      
      setPrediction(predictionResponse.data.prediction);
      
      // Formatting date for a cleaner chart X-axis
      const formattedData = dataResponse.data.map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        })
      }));
      setChartData(formattedData);

    } catch (err) {
      setError("Conexão falhou. Certifique-se de que o backend está rodando na porta correta."); 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label-date">{`Data: ${payload[0].payload.date}`}</p>
          <p className="label-price">{`Fechamento: R$ ${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-area">
          <BarChart3 className="logo-icon" />
          <h1>Alpha Predictor</h1>
        </div>
        <p className="subtitle">Análise Quantitativa e Machine Learning para a B3</p>
      </header>
      
      <main className="main-layout">
        {/* Chart Section */}
        <div className="chart-area">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="spinner" />
              <p>Carregando dados históricos...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <AlertTriangle className="error-icon" />
              <p className="error">{error}</p>
            </div>
          ) : chartData.length > 0 ? (
            <div className="chart-wrapper">
              <div className="chart-header">
                <h3>Variação de Preço (Último Ano)</h3>
                <span className="ticker-badge">{ticker}</span>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="dateFormatted" 
                    stroke="#64748B" 
                    fontSize={11}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={11}
                    tickLine={false} 
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorClose)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <Info className="info-icon" />
              <p>Selecione um ativo para visualizar os gráficos e as predições do modelo.</p>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="controls-area">
          <div className="controls">
            <h2>Selecione o Ativo</h2>
            <div className="button-group">
              <button 
                onClick={() => handlePredict('PETR4')} 
                disabled={loading}
                className={ticker === 'PETR4' ? 'active-btn' : ''}
              >
                {loading && ticker === 'PETR4' ? <Loader2 className="spinner-small" /> : 'PETR4'}
              </button>
              <button 
                onClick={() => handlePredict('VALE3')} 
                disabled={loading}
                className={ticker === 'VALE3' ? 'active-btn' : ''}
              >
                {loading && ticker === 'VALE3' ? <Loader2 className="spinner-small" /> : 'VALE3'}
              </button>
            </div>
          </div>
          
          <div className="results">
            <h2>Direção do Preço (D+1)</h2>
            {ticker && !loading && !error && prediction !== null ? (
              <div className="result-content">
                <p className="result-ticker">Previsão para Amanhã no fechamento:</p>
                {prediction === 1 ? (
                  <div className="trend-badge trend-up">
                    <TrendingUp className="trend-icon" />
                    <span>ALTA (UPTREND)</span>
                  </div>
                ) : (
                  <div className="trend-badge trend-down">
                    <TrendingDown className="trend-icon" />
                    <span>BAIXA (DOWNTREND)</span>
                  </div>
                )}
                <div className="disclaimer">
                  *Predição baseada em dados técnicos históricos. Não constitui recomendação de investimento.
                </div>
              </div>
            ) : loading ? (
              <div className="result-loading">
                <Loader2 className="spinner" />
                <p>Calculando...</p>
              </div>
            ) : (
              <div className="result-empty">
                <p>Aguardando ativo...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
