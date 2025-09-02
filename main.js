// Hot reload during development
const path = require('path');
require('electron-reload')(__dirname, {
  ignored: /node_modules|[\/\\]\./,
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});

// App ///////////////////////////////////////////////////////////////////
const { app, BrowserWindow, ipcMain } = require('electron');
const { readFileSync } = require("fs");
const { join } = require("path");

const { SerialPort } = require('serialport');

// ///////////////////////////////////////////////////////////////////////
function createWindow() {
  const win = new BrowserWindow({
    width: 1590,
    height: 840,
    icon: __dirname + '\\assets\\icon.ico',
    webPreferences: {
      preload: __dirname + "/preload.js",
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.setMenu(null);
  win.loadFile('renderer.html');
  win.webContents.openDevTools();
}

ipcMain.handle("get-icon", (event, name) => {
  try {
    const file = join(__dirname, "icons", `${name}.svg`);
    return readFileSync(file, "utf-8");
  } catch {
    return null;
  }
});

// ///////////////////////////////////////////////////////////////////////

app.whenReady().then(createWindow);

let port;

ipcMain.handle("serial-open", async (_, path) => {
  port = new SerialPort({
    path,
    baudRate: 460800,
  });

  return new Promise((resolve, reject) => {
    port.on("open", () => resolve("OK"));
    port.on("error", reject);
  });
});

ipcMain.handle("serial-send", async (_, buffer) => {
  if (!port) throw new Error("Port not open");
  return new Promise((resolve, reject) => {
    port.write(buffer, (err) => {
      if (err) reject(err);
      else resolve("SENT");
    });
  });
});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
