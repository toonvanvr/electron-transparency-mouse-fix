const electron = require('electron')
const {app, BrowserWindow} = electron

if (process.platform !== "win32")
  app.disableHardwareAcceleration()

app.on('ready', () => setTimeout(()=>{
  let win = new BrowserWindow({
    transparent: true,
    frame: false,
    width: 1280,
    height: 400,

    alwaysOnTop: true,
    acceptFirstMouse: true // Advised for a more intuitive experience
  })
  win.loadFile(`${__dirname}/demo.htm`)
  win.webContents.openDevTools({mode: 'undocked'})
}))

app.on('window-all-closed', ()=>app.quit())