import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  AlertTriangle, 
  Info, 
  BarChart3,
  Cpu
} from 'lucide-react';
import './App.css';

// Consuming Vite's environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [ticker, setTicker] = useState(null);       
  const [prediction, setPrediction] = useState(null); 
  const [chartData, setChartData] = useState([]);  
  const [backtestData, setBacktestData] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('price'); // 'price' or 'backtest'
  const [loading, setLoading] = useState(false);   
  const [error, setError] = useState(null);        

  // Persistent ticker list
  const [tickersList, setTickersList] = useState(() => {
    const saved = localStorage.getItem('alpha_tickers');
    return saved ? JSON.parse(saved) : ['PETR4', 'VALE3'];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTickerInput, setNewTickerInput] = useState('');

  const handleAddTicker = () => {
    const cleanTicker = newTickerInput.trim().toUpperCase();
    if (!cleanTicker) return;
    if (tickersList.includes(cleanTicker)) {
      alert("Este ativo já está na sua lista!");
      return;
    }
    const updatedList = [...tickersList, cleanTicker];
    setTickersList(updatedList);
    localStorage.setItem('alpha_tickers', JSON.stringify(updatedList));
    setNewTickerInput('');
    setShowAddModal(false);
    handlePredict(cleanTicker);
  };

  const handleAddSuggestedTicker = (sug) => {
    if (tickersList.includes(sug)) {
      handlePredict(sug);
      setShowAddModal(false);
      return;
    }
    const updatedList = [...tickersList, sug];
    setTickersList(updatedList);
    localStorage.setItem('alpha_tickers', JSON.stringify(updatedList));
    setShowAddModal(false);
    handlePredict(sug);
  };

  const handleDeleteTicker = (tToDelete) => {
    const updatedList = tickersList.filter(t => t !== tToDelete);
    setTickersList(updatedList);
    localStorage.setItem('alpha_tickers', JSON.stringify(updatedList));
    if (ticker === tToDelete) {
      setTicker(null);
      setPrediction(null);
      setChartData([]);
      setBacktestData([]);
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${API_URL}/model/metrics`);
        setModelMetrics(response.data);
      } catch (err) {
        console.error("Falha ao buscar as métricas do modelo", err);
      }
    };
    fetchMetrics();
  }, []);

  const handlePredict = async (selectedTicker) => {
    setTicker(selectedTicker);
    setLoading(true);
    setPrediction(null);
    setChartData([]);
    setBacktestData([]);
    setActiveTab('price');
    setError(null);

    try {
      const apiClient = axios.create({ timeout: 15000 }); // 15s timeout

      // Parallel request to backend
      const [predictionResponse, dataResponse, backtestResponse] = await Promise.all([
        apiClient.get(`${API_URL}/predict/${selectedTicker}`),
        apiClient.get(`${API_URL}/data/${selectedTicker}`),
        apiClient.get(`${API_URL}/backtest/${selectedTicker}`)
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

      const formattedBacktest = backtestResponse.data.map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        })
      }));
      setBacktestData(formattedBacktest);

    } catch (err) {
      setError("Conexão falhou. Certifique-se de que o backend está rodando na porta correta."); 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const getBacktestMetrics = () => {
    if (backtestData.length === 0) return null;
    const finalRow = backtestData[backtestData.length - 1];
    const initialBH = backtestData[0].buy_and_hold;
    const finalBH = finalRow.buy_and_hold;
    const finalStrat = finalRow.strategy;
    
    const returnBH = ((finalBH - initialBH) / initialBH) * 100;
    const returnStrat = ((finalStrat - 1000) / 1000) * 100;
    const outperformance = returnStrat - returnBH;
    
    return {
      finalBH,
      finalStrat,
      returnBH,
      returnStrat,
      outperformance
    };
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

  const BacktestTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label-date">{`Data: ${payload[0].payload.date}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="label-price" style={{ color: entry.color, margin: '4px 0 0 0', fontWeight: 'bold' }}>
              {`${entry.name}: R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          ))}
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
                <div className="chart-tabs">
                  <button 
                    className={`tab-btn ${activeTab === 'price' ? 'active' : ''}`}
                    onClick={() => setActiveTab('price')}
                  >
                    Preço do Ativo
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'backtest' ? 'active' : ''}`}
                    onClick={() => setActiveTab('backtest')}
                  >
                    Desempenho Financeiro (R$)
                  </button>
                </div>
                <span className="ticker-badge">{ticker}</span>
              </div>

              {activeTab === 'price' ? (
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
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={backtestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <Tooltip content={<BacktestTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line 
                      type="monotone" 
                      dataKey="buy_and_hold" 
                      name="Buy & Hold"
                      stroke="#EF4444" 
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="strategy" 
                      name="Modelo (Estratégia)"
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {activeTab === 'backtest' && (
                <div className="backtest-metrics-grid">
                  <div className="metric-card">
                    <span className="metric-label">Retorno Buy & Hold</span>
                    <span className={`metric-value ${getBacktestMetrics()?.returnBH >= 0 ? 'text-green' : 'text-red'}`}>
                      {getBacktestMetrics()?.returnBH.toFixed(2)}%
                      <span className="metric-sub">R$ {getBacktestMetrics()?.finalBH.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Retorno Modelo</span>
                    <span className={`metric-value ${getBacktestMetrics()?.returnStrat >= 0 ? 'text-green' : 'text-red'}`}>
                      {getBacktestMetrics()?.returnStrat.toFixed(2)}%
                      <span className="metric-sub">R$ {getBacktestMetrics()?.finalStrat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </span>
                  </div>
                  <div className="metric-card highlighted-metric">
                    <span className="metric-label">Alfa (Excesso de Retorno)</span>
                    <span className={`metric-value ${getBacktestMetrics()?.outperformance >= 0 ? 'text-green' : 'text-red'}`}>
                      {getBacktestMetrics()?.outperformance >= 0 ? '+' : ''}{getBacktestMetrics()?.outperformance.toFixed(2)}%
                      <span className="metric-sub">vs Buy & Hold</span>
                    </span>
                  </div>
                </div>
              )}
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
              {tickersList.map((t) => (
                <div key={t} className="ticker-btn-wrapper">
                  <button 
                    onClick={() => handlePredict(t)} 
                    disabled={loading}
                    className={`ticker-select-btn ${ticker === t ? 'active-btn' : ''}`}
                  >
                    {loading && ticker === t ? <Loader2 className="spinner-small" /> : t}
                  </button>
                  {t !== 'PETR4' && t !== 'VALE3' && (
                    <button 
                      className="delete-ticker-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTicker(t);
                      }}
                      title={`Remover ${t}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              <button className="add-ticker-trigger-btn" onClick={() => setShowAddModal(true)}>
                + Adicionar Ativo
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

      {/* Explainable AI / Model Metrics Section */}
      {modelMetrics && (
        <section className="metrics-section">
          <div className="section-title">
            <Cpu className="cpu-icon" />
            <h2>Explicabilidade e Métricas Globais da IA (XAI)</h2>
            <p>Indicadores estatísticos de relevância e matriz de confusão coletados durante a fase de validação</p>
          </div>
          
          <div className="metrics-grid-layout">
            {/* Feature Importance Bar Chart */}
            <div className="feature-importance-card">
              <h3>Importância das Features</h3>
              <p className="card-subtitle">Peso relativo que a IA atribui a cada indicador técnico nas decisões</p>
              <div className="importance-list">
                {modelMetrics.feature_importances.map((item, idx) => (
                  <div key={idx} className="importance-item">
                    <div className="importance-label-row">
                      <span className="importance-name">{item.name}</span>
                      <span className="importance-value">{item.value.toFixed(2)}%</span>
                    </div>
                    <div className="importance-bar-bg">
                      <div className="importance-bar-fill" style={{ width: `${item.value * 6}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confusion Matrix */}
            <div className="confusion-matrix-card">
              <h3>Matriz de Confusão (Validação de Teste)</h3>
              <p className="card-subtitle">Assertividade real do modelo em 550 simulações de fechamentos históricos</p>
              
              <div className="matrix-wrapper">
                <div className="matrix-grid">
                  <div className="matrix-cell correct">
                    <span className="matrix-number">{modelMetrics.confusion_matrix.true_negative}</span>
                    <span className="matrix-label">Acertou Baixa (TN)</span>
                  </div>
                  <div className="matrix-cell error-cell">
                    <span className="matrix-number">{modelMetrics.confusion_matrix.false_positive}</span>
                    <span className="matrix-label">Errou Alta (FP)</span>
                  </div>
                  <div className="matrix-cell error-cell">
                    <span className="matrix-number">{modelMetrics.confusion_matrix.false_negative}</span>
                    <span className="matrix-label">Errou Baixa (FN)</span>
                  </div>
                  <div className="matrix-cell correct">
                    <span className="matrix-number">{modelMetrics.confusion_matrix.true_positive}</span>
                    <span className="matrix-label">Acertou Alta (TP)</span>
                  </div>
                </div>
                
                <div className="matrix-summary">
                  <div className="summary-row">
                    <span>Acurácia Global:</span>
                    <strong className="text-blue">{(modelMetrics.confusion_matrix.accuracy * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="summary-row">
                    <span>Precisão:</span>
                    <strong>{(modelMetrics.confusion_matrix.precision * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="summary-row">
                    <span>Sensibilidade (Recall):</span>
                    <strong>{(modelMetrics.confusion_matrix.recall * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="summary-row">
                    <span>F1-Score:</span>
                    <strong>{(modelMetrics.confusion_matrix.f1_score * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Search / Add Ticker Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Novo Ativo (B3)</h3>
              <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">Digite o ticker da ação brasileira para buscar dados históricos do Yahoo Finance.</p>
              
              <div className="add-input-row">
                <input 
                  type="text" 
                  placeholder="Ex: ITUB4, MGLU3, ABEV3" 
                  value={newTickerInput}
                  onChange={(e) => setNewTickerInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTicker();
                  }}
                />
                <button className="add-submit-btn" onClick={handleAddTicker}>Adicionar</button>
              </div>
              
              <div className="suggestions-area">
                <h4>Sugestões Populares:</h4>
                <div className="suggestions-grid">
                  {['ITUB4', 'BBDC4', 'MGLU3', 'ABEV3', 'BBAS3', 'WEGE3'].map(sug => (
                    <button 
                      key={sug} 
                      className="suggestion-chip" 
                      onClick={() => handleAddSuggestedTicker(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
