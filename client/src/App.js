import React, { useState } from 'react';
import './App.css';

function App() {
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [outputFolder, setOutputFolder] = useState(() => localStorage.getItem('outputFolder') || '');

  // If folder is chosen, keep it in localStorage
  const handleChooseFolder = async () => {
    setError("");
    setOutput("");
    if (window.electronAPI && window.electronAPI.chooseOutputFolder) {
      const folder = await window.electronAPI.chooseOutputFolder();
      if (folder) {
        setOutputFolder(folder);
        localStorage.setItem('outputFolder', folder);
        setError('');
      }
    } else {
      setError('Could not choose folder: Electron API not available!');
    }
  };

  const handleGenerate = async () => {
    setError('');
    setOutput('');
    setLoading(true);
    try {
      if (!window.electronAPI || !window.electronAPI.generateWorksheets) {
        throw new Error('Electron API not found. Are you running inside Electron?');
      }
      if (!outputFolder) {
        throw new Error('Please select an output folder before generating.');
      }
      const result = await window.electronAPI.generateWorksheets(outputFolder);
      setOutput(result);
    } catch (err) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
  };

  // "Worksheets" button opens the chosen output folder if available, else alerts missing
  const handleFolderClick = () => {
    if (!outputFolder) {
      setError('No output folder selected!');
      return;
    }
    // In actual Electron, you’d use shell.openPath(outputFolder) via a custom IPC, or similar
    // Simulate the click here for now (actual implementation should be in main/preload)
    if (window.electronAPI && window.electronAPI.openOneDriveFolder) {
      window.electronAPI.openOneDriveFolder();
    } else {
      // fallback: try to open the folder with electron shell
      if (window.electronAPI && window.electronAPI.openPath) {
        window.electronAPI.openPath(outputFolder);
      } else {
        alert('Could not open folder: Electron API not available!');
      }
    }
  };

  return (
    <div className="app-bg">
      <div className="generator-container">
        <div className="header-row">
          <img
            src="https://raw.githubusercontent.com/primer/octicons/main/icons/file-badge-16.svg"
            alt="Logo"
            className="logo"
            style={{
              background: "#f1f5ff", borderRadius: "12px", padding: "9px", marginRight: "16px"
            }}
          />
          <div>
            <h1 className="title" style={{marginBottom: 0}}>Worksheet Generator</h1>
            <div className="byline" style={{marginTop: 2, fontSize: "1.04rem", color: "#8fa0c2"}}>RJ Dorey Ltd</div>
          </div>
        </div>
        {/* Choose output folder */}
        <div style={{ margin: "16px 0" }}>
          <button
            className="choose-folder-btn"
            onClick={handleChooseFolder}
            disabled={loading}
            title="Select the location to save worksheets"
            style={{
              background: "#eaf4fc",
              border: "none",
              borderRadius: "10px",
              padding: "12px 30px 12px 18px",
              fontSize: "1.05rem",
              color: "#2f3d6c",
              fontWeight: 500,
              boxShadow: "0 2px 9px rgba(36,98,184,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              transition: "background 0.18s, box-shadow 0.18s",
            }}
          >
            <span role="img" aria-label="folder" style={{ marginRight: 8, fontSize: "1.3em", marginBottom: "1px" }}>📁</span>
            Choose Output Folder
          </button>
          {outputFolder && (
            <span
              className="output-folder-label"
              style={{
                marginLeft: 16,
                color: "#446",
                opacity: 0.83,
                fontSize: "0.98rem"
              }}
            >
              <span role="img" aria-label="location" style={{marginRight: 6}}>📂</span>
              <b>{outputFolder}</b>
            </span>
          )}
        </div>
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading || !outputFolder}
          style={{
            background: outputFolder ? "linear-gradient(90deg, #4f70fa 0%, #3460bd 100%)" : "#afc9ee",
            border: "none",
            borderRadius: "12px",
            padding: "16px 34px",
            fontSize: "1.16rem",
            color: "#fff",
            fontWeight: 600,
            margin: "0 0 22px 0",
            boxShadow: "0 2.5px 14px rgba(77,110,220,0.12)",
            display: "flex",
            alignItems: "center",
            transition: "background 0.18s, box-shadow 0.18s",
            cursor: !outputFolder ? "not-allowed" : "pointer"
          }}
        >
          <span role="img" aria-label="doc-folder" style={{marginRight: 8, fontSize: "1.25em"}}>📝</span>
          {loading ? "Generating..." : "Generate Worksheets"}
        </button>
        {/* Folder button underneath */}
        <div className="folder-btn-under">
          <button
            className="folder-btn"
            title="Go to Worksheets Folder"
            onClick={handleFolderClick}
            disabled={!outputFolder}
            style={{
              background: "#e8f0fa",
              border: "none",
              borderRadius: "10px",
              padding: "9px 23px 9px 13px",
              fontSize: "1.04rem",
              color: "#154288",
              fontWeight: 500,
              boxShadow: "0 2px 7px rgba(84,140,224,0.09)",
              display: "flex",
              alignItems: "center",
              gap: 9,
              opacity: !outputFolder ? 0.7 : 1,
              cursor: !outputFolder ? "not-allowed" : "pointer"
            }}
          >
            <svg height="28" viewBox="0 0 24 24" width="28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="2" y="7" width="20" height="13" rx="3" fill="#1976d2"/>
              <path d="M2 8.5V7a3 3 0 0 1 3-3h4.2c.56 0 1.09.25 1.44.69l1.12 1.41A2 2 0 0 0 13.8 7H21a1 1 0 0 1 1 1v1.5" fill="#42a5f5"/>
              <rect x="7" y="15" width="10" height="2" rx="1" fill="#e3edfa"/>
            </svg>
            <span className="folder-label" style={{fontWeight: 550, fontSize: "1rem"}}>Worksheets</span>
          </button>
        </div>
        {(error || output) && (
          <div className={`result-box ${error ? 'error' : ''}`}
            style={{
              color: error ? "#be2230" : "#2b6c27",
              background: error ? "#f9e2e5" : "#eafce8",
              border: error ? "1px solid #da929a" : undefined,
              padding: "10px 13px",
              borderRadius: "7px",
              marginTop: "12px",
              fontSize: "1.08em",
              textAlign: "center",
              width: "99%",
              wordBreak: "break-word",
              fontFamily: error ? "'Menlo','Consolas','monospace',sans-serif" : undefined
            }}
          >
            {error ? `Error: ${error}` : output}
          </div>
        )}
      </div>
      <footer className="footer" style={{
        margin: "32px 0 0 0",
        fontSize: "0.97rem",
        color: "#8592aa",
        textAlign: "center",
        opacity: 0.69
      }}>
        &copy; {new Date().getFullYear()} RJ Dorey &mdash; All rights reserved.
      </footer>
    </div>
  );
}

export default App;