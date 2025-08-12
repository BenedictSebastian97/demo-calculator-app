import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005';

  // Fetch calculation history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = async (firstOperand, secondOperand, operation) => {
    try {
      const response = await fetch(`${API_URL}/api/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num1: firstOperand,
          num2: secondOperand,
          operation: operation
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Refresh history after successful calculation
        fetchHistory();
        return data.result;
      } else {
        alert(data.error);
        return firstOperand;
      }
    } catch (error) {
      alert('Error connecting to calculator service');
      return firstOperand;
    }
  };

  const handleEquals = async () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = await calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="App">
      <div className="calculator-container">
        <div className="calculator">
          <div className="display">
            {display}
          </div>
          <div className="buttons">
            <button className="btn btn-clear" onClick={clear}>C</button>
            <button className="btn btn-history" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide' : 'History'}
            </button>
            <button className="btn btn-operation" onClick={() => performOperation('divide')}>÷</button>
            <button className="btn btn-operation" onClick={() => performOperation('multiply')}>×</button>
            
            <button className="btn btn-number" onClick={() => inputNumber(7)}>7</button>
            <button className="btn btn-number" onClick={() => inputNumber(8)}>8</button>
            <button className="btn btn-number" onClick={() => inputNumber(9)}>9</button>
            <button className="btn btn-operation" onClick={() => performOperation('subtract')}>-</button>
            
            <button className="btn btn-number" onClick={() => inputNumber(4)}>4</button>
            <button className="btn btn-number" onClick={() => inputNumber(5)}>5</button>
            <button className="btn btn-number" onClick={() => inputNumber(6)}>6</button>
            <button className="btn btn-operation" onClick={() => performOperation('add')}>+</button>
            
            <button className="btn btn-number" onClick={() => inputNumber(1)}>1</button>
            <button className="btn btn-number" onClick={() => inputNumber(2)}>2</button>
            <button className="btn btn-number" onClick={() => inputNumber(3)}>3</button>
            <button className="btn btn-equals" onClick={handleEquals} rowSpan="2">=</button>
            
            <button className="btn btn-number btn-zero" onClick={() => inputNumber(0)}>0</button>
            <button className="btn btn-decimal" onClick={inputDecimal}>.</button>
          </div>
        </div>
        
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>Calculation History</h3>
              <button className="btn btn-clear-history" onClick={clearHistory}>
                Clear History
              </button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="no-history">No calculations yet</p>
              ) : (
                history.map((calc) => (
                  <div key={calc.id} className="history-item">
                    <span className="expression">{calc.expression}</span>
                    <span className="timestamp">
                      {new Date(calc.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;