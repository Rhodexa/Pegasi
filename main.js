// Hot reload during development

const path = require('path');
require('electron-reload')(__dirname, {
  ignored: /node_modules|[\/\\]\./,
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});

const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1590,
    height: 840,
    icon: __dirname + '/assets/icon.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.setMenu(null);
  win.loadFile('index.html');
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
