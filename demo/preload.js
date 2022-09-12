const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('etmf', {
  ignoreMouseEvents(enabled) {
    ipcRenderer.send('etmf', enabled)
  }
})