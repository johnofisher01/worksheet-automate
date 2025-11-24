import React, { useState } from 'react';

function App() {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/hello');
      const data = await res.json();
      setMsg(data.message);
    } catch (err) {
      setMsg('Error connecting to backend');
    }
    setLoading(false);
  };

  return (
    <div style={{padding: "2rem"}}>
      <h1>Electrician Worksheet Automate</h1>
      <button onClick={testBackend} disabled={loading}>
        {loading ? "Contacting backend..." : "Test Backend"}
      </button>
      <div style={{marginTop: "2rem"}}>
        {msg && <b>{msg}</b>}
      </div>
    </div>
  );
}

export default App;