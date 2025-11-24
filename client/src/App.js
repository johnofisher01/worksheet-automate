import React, { useState } from 'react';
import './App.css';

function App() {
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError('');
    setOutput('');
    setLoading(true);
    try {
      if (!window.electronAPI || !window.electronAPI.generateWorksheets) {
        throw new Error('Electron API not found. Are you running inside Electron?');
      }
      const result = await window.electronAPI.generateWorksheets();
      setOutput(result);
    } catch (err) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
  };

  // Open the OneDrive folder from Electron main process
  const handleFolderClick = () => {
    if (window.electronAPI && window.electronAPI.openOneDriveFolder) {
      window.electronAPI.openOneDriveFolder();
    } else {
      alert('Could not open folder: Electron API not available!');
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
          />
          <h1 className="title">Worksheet Generator</h1>
        </div>
        <div className="byline">by RJ Dorey</div>
        <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Worksheets"}
        </button>
        {/* Folder button underneath */}
        <div className="folder-btn-under">
          <button className="folder-btn" title="Go to Worksheets Folder" onClick={handleFolderClick}>
            <svg height="28" viewBox="0 0 24 24" width="28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="7" width="20" height="13" rx="3" fill="#1976d2"/>
              <path d="M2 8.5V7a3 3 0 0 1 3-3h4.2c.56 0 1.09.25 1.44.69l1.12 1.41A2 2 0 0 0 13.8 7H21a1 1 0 0 1 1 1v1.5" fill="#42a5f5"/>
              <rect x="7" y="15" width="10" height="2" rx="1" fill="#e3edfa"/>
            </svg>
            <span className="folder-label">Worksheets</span>
          </button>
        </div>
        {(error || output) && (
          <div className={`result-box ${error ? 'error' : ''}`}>
            {error ? `Error: ${error}` : output}
          </div>
        )}
      </div>
      <footer className="footer">
        &copy; {new Date().getFullYear()} RJ Dorey &mdash; All rights reserved.
      </footer>
    </div>
  );
}

export default App;