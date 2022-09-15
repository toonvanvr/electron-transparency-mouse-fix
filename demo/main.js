const { BrowserWindow, app } = require('electron')
const npath = require('node:path')
const { EtmfMain } = require('../lib/dist/electron/etmf-main')

const preload = npath.join(__dirname, './dist/preload.js')
const html = npath.join(__dirname, './demo.html')

!(async function main() {
  await app.whenReady()

  const win = new BrowserWindow({
    transparent: true,
    frame: false,
    hasShadow: false,
    roundedCorners: false,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      preload,
    },
  })

  win.loadFile(html)

  new EtmfMain({ log: console.log })
})()
