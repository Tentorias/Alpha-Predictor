import React, { useState} from "react";
import "./App.css";

function App() {
    // "useState to manage the state of the input field and the list of items"
    const [ticker, setTicker] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loadging, setLoading] = useState(false);

    const handlePredict = (selectedTicker) => {
        // for now just simule the logic
        console.log("selecionado:", selectedTicker);
        setTicker(selectedTicker);
        // in future, make an API call to fetch prediction data with Axios
    };

    return (
        <div className = "container">
            <header classeName = "header">
                <h1>Alpha prediction</h1>
            </header>

            <main className = "container">
                <div classname = "controls">
                    <h2>Select the Asset</h2>
                    <button onClick = {() => handlePredict("PETR4")} >PETR4</button>
                    <button onClick = {() => handlePredict("VALE3")} >VALE3</button>
                </div>

                <div className = "result">
                    {/* This area will show the prediction result */}
                    {ticker && (
                        <h3>Forecast for: {ticker}</h3>
                    )}

                    {loading ? (
                        <p>Loading forecast...</p>
                    ) : (
                        <p>The result will appear here.</p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;