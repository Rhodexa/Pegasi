const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("serial", {
  list: () => ipcRenderer.invoke("serial:list"),
  open: (path) => ipcRenderer.invoke("serial:connect", path),
  send: (data) => ipcRenderer.send("serial:send", data),
  onDisconnected: (callback) => ipcRenderer.on("serial:disconnected", callback),
  onError: (callback) => ipcRenderer.on("serial:error", (e, msg) => callback(msg))
});



contextBridge.exposeInMainWorld("icons", {
  get: (name) => ipcRenderer.invoke("get-icon", name)
})