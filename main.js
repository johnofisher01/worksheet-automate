const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Always load .env at the root
require('dotenv').config();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'server', 'electron-preload.js'), // NOW POINTS TO server/
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'client', 'build', 'index.html'));
}

app.whenReady().then(createWindow);

ipcMain.handle('chooseOutputFolder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths[0]) return null;
  return result.filePaths[0];
});

ipcMain.handle('generateWorksheets', async (event, outputFolder) => {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, 'server', 'fillFromSheet.js');
    // The important fix: use process.execPath instead of 'node'
    const child = spawn(process.execPath, [scriptPath, '--output', outputFolder], { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (data) => output += data.toString());
    child.stderr.on('data', (data) => output += '\n' + data.toString());
    child.on('close', () => resolve(output || 'Done!'));
    child.on('error', (err) => resolve(`Error: ${err.message}`));
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});