const electron = require('electron')
const {app, BrowserWindow} = electron

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
}, 250)) // Transparency on Linux requires a timeout

app.on('window-all-closed', ()=>app.quit())