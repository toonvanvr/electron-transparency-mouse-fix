const electron = require('electron')
const {app, BrowserWindow} = electron

if (process.platform !== "win32")
  app.disableHardwareAcceleration()

app.on('ready', () => setTimeout(()=>{
  let win = new BrowserWindow({
    transparent: true,
    frame: false,
    width: 250,
    height: 250,
    alwaysOnTop: true
  })
  win.loadFile(`${__dirname}/demo.htm`)
}))

app.on('window-all-closed', ()=>app.quit())