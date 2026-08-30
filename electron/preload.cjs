const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("certusNative", {
  fetchJson: (url) => ipcRenderer.invoke("certus-fetch-json", url),
});
