const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serial", {
  open: (path) => ipcRenderer.invoke("serial-open", path),
  send: (data) => ipcRenderer.invoke("serial-send", data),
});

contextBridge.exposeInMainWorld("icons", {
  get: (name) => ipcRenderer.invoke("get-icon", name)
})