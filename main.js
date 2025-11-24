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

// IPC for opening the OneDrive Worksheets ONLINE web folder
ipcMain.handle('openOneDriveFolder', async () => {
  // Use your provided OneDrive web folder link below:
  const oneDriveWebUrl = "https://onedrive.live.com/?id=%2Fpersonal%2F863da6a4189dcf94%2FDocuments%2FDocuments%2FStaff%20Day%20Sheets%2FWORKSHEET%2DOUTPUT&listurl=%2Fpersonal%2F863da6a4189dcf94%2FDocuments";
  return shell.openExternal(oneDriveWebUrl);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});