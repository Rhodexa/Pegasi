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
const { SerialPort }  = require("serialport");

// ///////////////////////////////////////////////////////////////////////
let win;
function createWindow() {
  win = new BrowserWindow({
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
  win.loadFile('./renderer.html');
  win.webContents.openDevTools();
}

ipcMain.handle("get-icon", (event, name) => {
  try {
    const file = path.resolve(__dirname, "icons", `${name}.svg`);
    return readFileSync(file, "utf-8");
  } catch (err) {
    console.error(`Failed to load icon ${name}:`, err);
    return null;
  }
});

// Serial ///////////////////////////////////////////////////////////////////////

let currentPort = null;

// --- Serial IPC ---
ipcMain.handle("serial:list", async () => {
  const ports = await SerialPort.list();
  return ports.map(p => p.path);
});

ipcMain.handle("serial:connect", async (event, path) => {
  if (currentPort) currentPort.close();
  currentPort = new SerialPort({ path, baudRate: 460800 });

  currentPort.on("close", () => {
    win.webContents.send("serial:disconnected");
  });

  currentPort.on("error", (err) => {
    win.webContents.send("serial:error", err.message);
  });

  return new Promise((resolve, reject) => {
    currentPort.on("open", () => resolve(true));
    currentPort.on("error", (err) => reject(err.message));
  });
});

ipcMain.on("serial:send", (event, data) => {
  if (!currentPort || !currentPort.isOpen) return;
  
  // If renderer sent Uint8Array, write directly
  if (data instanceof Uint8Array) {
    currentPort.write(data, (err) => {
      if (err) console.error("Serial write error:", err);
    });
  } else if (typeof data === "string") {
    currentPort.write(data, (err) => {
      if (err) console.error("Serial write error:", err);
    });
  }
});

/////////////////////////////////////////////////////////////////////////

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
