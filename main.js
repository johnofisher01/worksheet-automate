const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      // Preload script path
      preload: path.join(__dirname, 'server', 'electron-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'client', 'build', 'index.html'));
}

// IPC for generating worksheets
ipcMain.handle('generateWorksheets', async () => {
  const scriptPath = path.join(__dirname, 'server', 'fillFromSheet.js');
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptPath], { cwd: path.dirname(scriptPath) });
    let output = '';
    child.stdout.on('data', data => output += data.toString());
    child.stderr.on('data', data => output += '\n' + data.toString());
    child.on('close', code => resolve(output));
    child.on('error', err => reject(err));
  });
});

// IPC for opening OneDrive Worksheets folder
ipcMain.handle('openOneDriveFolder', async () => {
  // TODO: Set the correct path for your system!
  // WINDOWS EXAMPLE:
  // const oneDriveFolder = 'C:\\Users\\YourName\\OneDrive\\Worksheets';
  // MAC EXAMPLE:
  // const oneDriveFolder = '/Users/YourName/OneDrive/Worksheets';

  // ---- EDIT THIS FOR YOUR SYSTEM ----
  const oneDriveFolder = '/Users/YOURNAME/OneDrive/Worksheets';
  // ----                           ----

  // Open the folder in file explorer
  return shell.openPath(oneDriveFolder);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});