// Hot reload during development

const path = require('path');
require('electron-reload')(__dirname, {
  ignored: /node_modules|[\/\\]\./,
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});

const { app, BrowserWindow, ipcMain } = require('electron');

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
  win.loadFile('renderer.html');
  win.webContents.openDevTools();
}

// IPC listener: Node receives frame info
ipcMain.on('frame-timestamp', (event, data) => {
  const { frameIndex, timestamp } = data;
  //console.log(`Node got frame ${frameIndex} at time ${timestamp.toFixed(3)}s`);
  
  // Here you could:
  // - load/process the frame via FFmpeg
  // - create UART packet
  // - send it out
});


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
