/*
Bugs
----
- script stops working on reload (CTRL+R/F5/...) => only works after restarting electron

Possible performance improvements:
----------------------------------
- flag/refresh-function for static content (or dom edited event?) which converts selectors to htmlelements so the mousemove path elements don't all get checked by selector/className on every move (= string comparison)
- if/else for logging, so the `formatted strings` don't get parsed (=cpu-time) before sending them to a void function
- don't reapply the same value to 'win.setIgnoreMouseEvents', cache the prev value & check for change on write
*/

const electron = require('electron')

const consolePrefix = [
  '%celectron-transparency-mouse-fix',
   `margin-right: .25em;
    padding: .1em .4em;
    border-radius: .25em; 
    background-color: #3eabdc;
    color: white;
    font-weight: bold;`
]

module.exports = class TransparencyMouseFix {

  constructor ({
      electronWindow= electron.remote.getCurrentWindow(),
      htmlWindow= window,
      blackListClass= 'mouse-off',
      blackListElements= [],
      blackListSelectors= [],
      whiteListClass= 'mouse-on',
      whiteListElements= [],
      whiteListSelectors= [],
      mode= 'pointer-events',
      log= false,
      latch= true,
  }={}) {
    this.log = log
    this.listener = event => this.onMouseEvent(event)
    this.latch = latch
    this.handlingMouseEvents = true
    this.electronWindow = electronWindow
    this.htmlWindow = htmlWindow
    this.blackList = Object.freeze({
      className: blackListClass,
      elements: new Set(blackListElements),
      selectors: Array.from(blackListSelectors),
    })
    this.whiteList = Object.freeze({
      className: whiteListClass,
      elements: new Set(whiteListElements),
      selectors: Array.from(whiteListSelectors)
    })
    this.mode = mode
  }

  get log () {
    return this._log
  }

  set log ( log ) {
    if (typeof(log) === 'function')
      this._log = log
    else if (log)
      this._log = function ( level, ...msg ) {
        console[level](...consolePrefix, ...msg)
      }
    else
      this._log = false
  }

  set mode ( mode ) {
    this._mode = mode = mode.toLowerCase()
    if (mode !== 'pointer-events') {
      console.warn(
        ...consolePrefix, '\n',
        `  '${mode}' mode is deprecated in favor of 'pointer-events'\n` +
        '  This feature is planned for removal in version 1.0.0.')
    }
  }

  get mode () {
    return this._mode 
  }

  get htmlWindow () {return this._htmlWindow}

  set htmlWindow ( htmlWindow ) {
    if (this._htmlWindow)
      this.unregisterWindow(this._htmlWindow)
    this._htmlWindow = htmlWindow
    this.registerWindow(this._htmlWindow)
  }

  registerWindow ( window ) {
    window.addEventListener('mousemove', this.listener)
    window.addEventListener('dragover', this.listener)
    let styleSheet = window.document.createElement('style')
    styleSheet.classList.add('etmf-css')
    styleSheet.innerHTML = `
      html {pointer-events: none}
      body {position: relative}
    `
    window.addEventListener('beforeunload', event =>
      this.unregisterWindow(window))
    this.log && this.log('info', 'Registered event listener')
  }

  unregisterWindow ( window ) {
    window.removeEventListener('mousemove', this.listener)
    window.removeEventListener('dragover', this.listener)
    this.electronWindow.setIgnoreMouseEvents(false, {forward: true})
    for (let styleSheet of window.document.querySelectorAll('.etmf-css'))
      styleSheet.parentNode.removeChild(styleSheet)
    this.log && this.log('info', 'Removed event listener')
  }

  onMouseEvent ( event ) {
    this.log && this.log('debug', event)

    let hole = event.target.classList.contains('etmf-hole')

    /*
      FIXME: dragover ignores too many events
      - hover effects stop working
      - can't drag a file from inside electron into a void
    */
    if (event.type === 'dragover') {
      event.preventDefault() // fixes drop event
      if (!hole)
        return
    }

    switch (this.mode) {
      case 'blacklist':
        var handleMouseEvents = this.blackListAllows(event.path)
        break
      case 'whitelist':
        var handleMouseEvents = this.whiteListAllows(event.path)
        break
      case 'pointer-events': // preferred method
        var handleMouseEvents = event.target !== this.htmlWindow.document.documentElement && !hole
        break
      default:
        throw {
          msg: `Unknown mode '${this.mode}' for TransparencyMouseFix instance`,
          mode: this.mode,
          instance: this
        }
    }

    if (handleMouseEvents) {
      if (this.latch && this.handlingMouseEvents)
        return
      this.electronWindow.setIgnoreMouseEvents(false, {forward: true})
      this.log && this.log('info', 'mouse on')
    } else {
      if (this.latch && !this.handlingMouseEvents)
        return
      this.electronWindow.setIgnoreMouseEvents(true, {forward: true})
      this.log && this.log('info', 'mouse off')
    }
    this.handlingMouseEvents = handleMouseEvents
  }

  // deprecated
  blackListAllows ( tree ) {
    for (let el of tree) {
      // skip 'global' variable
      if (!el.classList) {
        //this.log && this.log('debug', 'blacklist →', el)
        continue
      }

      // match with blacklisted elements
      if (this.blackList.elements.has(el)) {
        //this.log && this.log('debug', 'blacklist →', el)
        continue
      }

      // match with blacklisted className
      if (el.classList.contains(this.blackList.className)) {
        //this.log && this.log('debug', `blacklist → .${this.blackList.className}`)
        continue
      }

      // match the element with blacklist selectors (CPU-heavy?)
      let match = this.blackList.selectors
        .find(sel => el.matches(sel))
      if (match) {
        //this.log && this.log('debug', `blacklist → ${match}`)
        continue
      }

      this.log && this.log('debug', 'blacklist ≠', el)
      return true
    }

    return false
  }

  // deprecated
  whiteListAllows ( tree ) {
    for (let el of tree) {

      // skip 'global' variable
      if (!el.classList) {
        continue
      }

      // match with whitelisted elements
      if (this.whiteList.elements.has(el)) {
        this.log && this.log('debug', 'whitelist →', el)
        return true
      }

      // match with whitelisted className
      if (el.classList.contains(this.whiteList.className)) {
        this.log && this.log('debug', `whitelist → .${this.whiteList.className}`)
        return true
      }

      // match the element with whitelist selectors (CPU-heavy?)
      let match = this.whiteList.selectors
        .find(sel => el.matches(sel))
      if (match) {
        this.log && this.log('debug', 'whiteList →', this.whiteList.selectors)
        return true
      }
    }

    return false
  }

}