const { app, BrowserWindow, ipcMain } = require('electron')
const npath = require('path')

!async function run() {
  await app.whenReady()

  const win = new BrowserWindow({
    webPreferences: {
      preload: npath.join(__dirname, 'preload.js')
    }
  })
  win.loadFile(npath.join(__dirname, 'index.html'))

  ipcMain.on('etmf', function (event, enabled) {
    console.log(`ignore mouse events: ${enabled}`)
    win.setIgnoreMouseEvents(enabled, { forward: true })
  })
}()