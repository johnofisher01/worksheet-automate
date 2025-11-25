import React, { useState } from 'react';
import './App.css';

const USERS = {
  "john.dorey@rjdorey.co.uk": "John1234!",
  "claire.broadhurst@rjdorey.co.uk": "Claire1234!"
};
const APP_TITLE = "RJDorey Worksheet Automater";

function App() {
  // Auth state
  const [signedIn, setSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [pwShow, setPwShow] = useState(false);
  const [authError, setAuthError] = useState("");

  // Main app state
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [outputFolder, setOutputFolder] = useState(() => localStorage.getItem('outputFolder') || '');

  // Login logic
  const handleLogin = (e) => {
    e.preventDefault();
    const emailLower = emailInput.trim().toLowerCase();
    if (!USERS[emailLower]) {
      setAuthError("Unrecognized email address.");
      return;
    }
    if (USERS[emailLower] !== pwInput) {
      setAuthError("Incorrect password.");
      return;
    }
    setUserEmail(emailLower);
    setSignedIn(true);
    setAuthError('');
    setPwInput('');
  };

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

  const handleFolderClick = () => {
    if (!outputFolder) {
      setError('No output folder selected!');
      return;
    }
    if (window.electronAPI && window.electronAPI.openOneDriveFolder) {
      window.electronAPI.openOneDriveFolder();
    } else if (window.electronAPI && window.electronAPI.openPath) {
      window.electronAPI.openPath(outputFolder);
    } else {
      alert('Could not open folder: Electron API not available!');
    }
  };

  // -------- UI --------
  if (!signedIn) {
    return (
      <div className="login-bg">
        <form className="login-panel" onSubmit={handleLogin}>
          <div className="login-title">{APP_TITLE}</div>
          <div className="login-subtitle">Sign in to continue</div>
          <input
            className="login-input"
            type="email"
            required
            autoFocus
            placeholder="Email address"
            value={emailInput}
            autoComplete="username"
            onChange={e => setEmailInput(e.target.value)}
          />
          <div className="pw-row">
            <input
              className="login-input"
              type={pwShow ? "text" : "password"}
              required
              placeholder="Password"
              value={pwInput}
              autoComplete="current-password"
              onChange={e => setPwInput(e.target.value)}
              style={{ marginRight: 6 }}
            />
            <button
              type="button"
              className="pw-toggle"
              tabIndex={-1}
              aria-label={pwShow ? "Hide password" : "Show password"}
              onClick={() => setPwShow(s => !s)}
            >
              {pwShow ? "🙈" : "👁️"}
            </button>
          </div>
          {authError && <div className="login-error">{authError}</div>}
          <button className="login-submit" type="submit">
            Sign In
          </button>
          <div className="login-footer">
            <span style={{ opacity: 0.65 }}>Access restricted to:<br /><b>john.dorey@rjdorey.co.uk</b> &amp; <b>claire.broadhurst@rjdorey.co.uk</b></span>
          </div>
        </form>
      </div>
    );
  }

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
            <h1 className="title" style={{marginBottom: 0}}>{APP_TITLE}</h1>
            <div className="byline">
              Signed in as <span style={{color:"#1976d2"}}>{userEmail}</span>
            </div>
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
          <div className={`result-box${error ? " error" : ""}`}>
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