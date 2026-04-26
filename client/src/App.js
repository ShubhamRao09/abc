import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5001";

const WEATHER_ICONS = {
  Sunny: "☀️", Cloudy: "☁️", Rainy: "🌧️", "Partly Cloudy": "⛅",
};

/* ── Syntax-highlighted JSON ── */
function JsonView({ data }) {
  if (!data) return null;
  const str = JSON.stringify(data, null, 2);
  const html = str.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")\s*:/g,
    '<span class="json-key">$1</span>:'
  ).replace(
    /:\s*("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")/g,
    ': <span class="json-str">$1</span>'
  ).replace(
    /:\s*(-?\d+\.?\d*)/g,
    ': <span class="json-num">$1</span>'
  ).replace(
    /:\s*(null|true|false)/g,
    ': <span class="json-null">$1</span>'
  );
  return <div className="json-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ════════════════════════════════════════
   PAGE 1: CALCULATOR
   ════════════════════════════════════════ */
function CalculatorPage() {
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [expr, setExpr] = useState("");
  const [activeOp, setActiveOp] = useState("");
  const [animKey, setAnimKey] = useState(0);
  const [reqData, setReqData] = useState(null);
  const [resData, setResData] = useState(null);
  const [status, setStatus] = useState("idle");

  const calc = async (op) => {
    const a = Number(n1), b = Number(n2);
    if (n1 === "" || n2 === "") {
      setError("Please enter both numbers");
      setResult(null);
      return;
    }
    setActiveOp(op);
    setError("");
    setStatus("loading");
    const body = { a, b };
    setReqData({ method: "POST", url: `${API}/${op}`, body });
    const syms = { add: "+", subtract: "−", multiply: "×", divide: "÷" };
    try {
      const res = await axios.post(`${API}/${op}`, body);
      setResult(res.data.result);
      setExpr(`${a} ${syms[op]} ${b}`);
      setResData({ status: 200, data: res.data });
      setStatus("success");
      setAnimKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.error || "Server error";
      setError(msg);
      setResult(null);
      setResData({ status: err.response?.status || 500, data: err.response?.data || { error: msg } });
      setStatus("error");
    }
  };

  return (
    <div className="page-grid" key="calc">
      {/* ── CLIENT SIDE ── */}
      <div className="glass-card">
        <div className="side-label client-label"><span className="label-dot"></span> Client Side</div>
        <div className="card-header">
          <div className="card-icon client">🧮</div>
          <div>
            <div className="card-title">Calculator Client</div>
            <div className="card-subtitle">Sends POST requests to server</div>
          </div>
        </div>

        <div className="input-group">
          <div className="input-field">
            <label>Number 1</label>
            <input id="num1" type="number" placeholder="Enter value" value={n1} onChange={(e) => setN1(e.target.value)} />
          </div>
          <div className="input-field">
            <label>Number 2</label>
            <input id="num2" type="number" placeholder="Enter value" value={n2} onChange={(e) => setN2(e.target.value)} />
          </div>
        </div>

        <div className="op-buttons">
          {[["add", "+", "Add"], ["subtract", "−", "Sub"], ["multiply", "×", "Mul"], ["divide", "÷", "Div"]].map(([op, sym, lbl]) => (
            <button key={op} id={`btn-${op}`} className={`op-btn ${op} ${activeOp === op ? "active" : ""}`} onClick={() => calc(op)}>
              <span className="sym">{sym}</span><span className="lbl">{lbl}</span>
            </button>
          ))}
        </div>

        <div className={`result-box ${result !== null ? "success" : ""} ${error ? "error" : ""}`}>
          {result !== null && !error ? (
            <div key={animKey} className="result-animate">
              <div className="result-lbl">Result</div>
              <div className="result-val">{result}</div>
              <div className="result-expr">{expr}</div>
            </div>
          ) : error ? (
            <div><div className="result-lbl">Error</div><div className="result-val err">{error}</div></div>
          ) : (
            <div className="result-ph">Select an operation to calculate</div>
          )}
        </div>
      </div>

      {/* ── SERVER SIDE ── */}
      <div className="glass-card">
        <div className="side-label server-label"><span className="label-dot"></span> Server Side</div>
        <div className="card-header">
          <div className="card-icon server">🖥️</div>
          <div>
            <div className="card-title">Express Server</div>
            <div className="card-subtitle">http://localhost:5001</div>
          </div>
        </div>

        <div className="status-bar">
          <span className={`status-dot ${status === "idle" ? "waiting" : "online"}`}></span>
          <span className="status-text">
            {status === "idle" && "Waiting for request..."}
            {status === "loading" && "Processing request..."}
            {status === "success" && "Response sent ✓"}
            {status === "error" && "Error response sent"}
          </span>
          <span className="status-method post">POST</span>
        </div>

        {reqData ? (
          <>
            <div className="json-section">
              <div className="json-label req"><span className="arrow">📥</span> Incoming Request</div>
              <JsonView data={reqData} />
            </div>
            <div className="json-section">
              <div className="json-label res"><span className="arrow">📤</span> Server Response</div>
              {resData ? <JsonView data={resData} /> : <div className="spinner"></div>}
            </div>
          </>
        ) : (
          <div className="json-placeholder">
            Perform a calculation on the client to see the request/response flow
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   PAGE 2: WEATHER
   ════════════════════════════════════════ */
function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reqData, setReqData] = useState(null);
  const [resData, setResData] = useState(null);
  const [status, setStatus] = useState("idle");

  const fetch_weather = async () => {
    setLoading(true);
    setStatus("loading");
    setReqData({ method: "GET", url: `${API}/weather` });
    setResData(null);
    try {
      const res = await axios.get(`${API}/weather`);
      setWeather(res.data);
      setResData({ status: 200, data: res.data });
      setStatus("success");
    } catch {
      setWeather(null);
      setResData({ status: 500, data: { error: "Failed to fetch" } });
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="page-grid" key="weather">
      {/* ── CLIENT SIDE ── */}
      <div className="glass-card">
        <div className="side-label client-label"><span className="label-dot"></span> Client Side</div>
        <div className="card-header">
          <div className="card-icon client">🌤️</div>
          <div>
            <div className="card-title">Weather Client</div>
            <div className="card-subtitle">Sends GET request to server</div>
          </div>
        </div>

        <button id="btn-weather" className="weather-btn" onClick={fetch_weather} disabled={loading}>
          {loading ? <><span className="spinner"></span> Fetching…</> : <><span>📡</span> Fetch Weather Data</>}
        </button>

        {weather ? (
          <div className="weather-data">
            <div className="weather-main">
              <div className="weather-city">📍 {weather.city}</div>
              <div className="weather-temp">{weather.temperature}</div>
              <div className="weather-cond">{WEATHER_ICONS[weather.condition] || "🌈"} {weather.condition}</div>
            </div>
            <div className="weather-stats">
              <div className="stat-item"><div className="stat-icon">💧</div><div className="stat-val">{weather.humidity}</div><div className="stat-lbl">Humidity</div></div>
              <div className="stat-item"><div className="stat-icon">💨</div><div className="stat-val">{weather.wind}</div><div className="stat-lbl">Wind</div></div>
              <div className="stat-item"><div className="stat-icon">🌡️</div><div className="stat-val">{weather.feelsLike}</div><div className="stat-lbl">Feels Like</div></div>
            </div>
            {weather.forecast && (
              <>
                <div className="fc-title">5-Day Forecast</div>
                <div className="fc-grid">
                  {weather.forecast.map((f, i) => (
                    <div className="fc-item" key={i}>
                      <div className="fc-day">{f.day}</div>
                      <div className="fc-icon">{WEATHER_ICONS[f.condition] || "🌈"}</div>
                      <div className="fc-temp">{f.temp}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="weather-ph"><div className="ph-icon">🌍</div><p>Click the button to fetch weather data</p></div>
        )}
      </div>

      {/* ── SERVER SIDE ── */}
      <div className="glass-card">
        <div className="side-label server-label"><span className="label-dot"></span> Server Side</div>
        <div className="card-header">
          <div className="card-icon server">🖥️</div>
          <div>
            <div className="card-title">Express Server</div>
            <div className="card-subtitle">http://localhost:5001</div>
          </div>
        </div>

        <div className="status-bar">
          <span className={`status-dot ${status === "idle" ? "waiting" : "online"}`}></span>
          <span className="status-text">
            {status === "idle" && "Waiting for request..."}
            {status === "loading" && "Processing request..."}
            {status === "success" && "Response sent ✓"}
            {status === "error" && "Error response sent"}
          </span>
          <span className="status-method get">GET</span>
        </div>

        {reqData ? (
          <>
            <div className="json-section">
              <div className="json-label req"><span className="arrow">📥</span> Incoming Request</div>
              <JsonView data={reqData} />
            </div>
            <div className="json-section">
              <div className="json-label res"><span className="arrow">📤</span> Server Response</div>
              {resData ? <JsonView data={resData} /> : <div className="spinner"></div>}
            </div>
          </>
        ) : (
          <div className="json-placeholder">
            Click "Fetch Weather Data" to see the request/response flow
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════ */
function App() {
  const [page, setPage] = useState("calculator");

  return (
    <div className="app-wrapper">
      <div className="container">
        <header className="header">
          <div className="header-badge"><span className="dot"></span> Distributed Web Service</div>
          <h1>Client-Server Architecture</h1>
          <p>A REST API demonstrating client-server communication with real-time request/response visualization</p>
        </header>

        <div className="nav-tabs">
          <button className={`nav-tab ${page === "calculator" ? "active" : ""}`} onClick={() => setPage("calculator")}>
            <span className="tab-icon">🧮</span> Calculator Service <span className="tab-method post">POST</span>
          </button>
          <button className={`nav-tab ${page === "weather" ? "active" : ""}`} onClick={() => setPage("weather")}>
            <span className="tab-icon">🌤️</span> Weather Service <span className="tab-method get">GET</span>
          </button>
        </div>

        {page === "calculator" ? <CalculatorPage /> : <WeatherPage />}

        <footer className="footer">
          <p>Client-Server Distributed Architecture Demo</p>
          <div className="tech-stack">
            <span className="tech-tag">React</span>
            <span className="tech-tag">Axios</span>
            <span className="tech-tag">Node.js</span>
            <span className="tech-tag">Express</span>
            <span className="tech-tag">REST API</span>
            <span className="tech-tag">JSON</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
