const electron = require("electron");
const { app, BrowserWindow } = electron;
const npath = require("path");

// Globals
const { DEV } = process.env;
const index = npath.join(__dirname, "demo.html");
const win = {};

// Lifecycle
app.on("ready", run);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => win.widget === null && createWidget());

// Run
function run() {
  createWidget(index);
  if (DEV) {
    devMode();
  }
}

// Window creation
function createWidget(page) {
  const w = (win.widget = new BrowserWindow({
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
    },
    width: 1000,
    height: 900,
    x: 0,
    y: 0,
    show: false,
    // alwaysOnTop: true,
    frame: false,
    transparent: true,
    // closable: false,
    // resizable: false,
    // minimizable: false,
    // maximizable: false,
    // movable: true
  }));

  // Lifecycle
  w.on("closed", function () {
    win.widget = null;
  });
  w.once("ready-to-show", function () {
    win.widget.show();
  });

  // Run
  w.loadFile(page);

  return w;
}

// Developer mode
function devMode() {
  win.widget.webContents.openDevTools({ mode: "detach" });
}
