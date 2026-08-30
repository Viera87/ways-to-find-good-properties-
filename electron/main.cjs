const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const path = require("path");

app.setName("CERTUS");
// Spreadsheet desk — skip GPU so the window opens on machines without a usable GPU.
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");

function iconPath() {
  const candidates = [
    path.join(__dirname, "..", "build", "icon.png"),
    path.join(__dirname, "..", "public", "icon-512.png"),
    path.join(process.resourcesPath || "", "icon.png"),
  ];
  return candidates.find((p) => p && fs.existsSync(p));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    title: "CERTUS — Tax Lien Underwriting Desk",
    backgroundColor: "#0b0f14",
    autoHideMenuBar: true,
    icon: iconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const index = path.join(__dirname, "..", "dist", "index.html");
  if (!fs.existsSync(index)) {
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          "<body style='background:#0b0f14;color:#e8edf4;font:16px sans-serif;padding:40px'>" +
            "<h1>CERTUS is not built yet</h1>" +
            "<p>Run <code>npm run desktop</code> from the project folder. That builds the desk and opens this window.</p>" +
            "</body>",
        ),
    );
    return;
  }

  win.loadFile(index);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("file:")) return;
    event.preventDefault();
    if (/^https?:/i.test(url)) shell.openExternal(url);
  });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
