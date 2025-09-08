import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [ticker, setTicker] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (selectedTicker) => {
    setTicker(selectedTicker);
    setLoading(true);
    setPrediction(null);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/predict/${selectedTicker}`);
      setPrediction(response.data.prediction);
    } catch (err) {
      setError("Could not fetch the prediction. Is the API online?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderPredictionResult = () => {
    if (loading) {
      return <p>Loading prediction...</p>;
    }
    if (error) {
      return <p className="error">{error}</p>;
    }
    if (prediction !== null) {
      const trend = prediction === 1 ? 'Uptrend' : 'Downtrend';
      const trendClass = prediction === 1 ? 'trend-up' : 'trend-down';
      return <h3 className={trendClass}>{trend}</h3>;
    }
    return <p>Select a stock to see the prediction.</p>;
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Alpha Predictor</h1>
      </header>
      
      <main className="main">
        <div className="controls">
          <h2>Select a Stock</h2>
          <button onClick={() => handlePredict('PETR4')} disabled={loading}>
            {loading && ticker === 'PETR4' ? '...' : 'PETR4'}
          </button>
          <button onClick={() => handlePredict('VALE3')} disabled={loading}>
            {loading && ticker === 'VALE3' ? '...' : 'VALE3'}
          </button>
        </div>
        
        <div className="results">
          {ticker && <h4>Result for: {ticker}</h4>}
          {renderPredictionResult()}
        </div>
      </main>
    </div>
  );
}

export default App;
