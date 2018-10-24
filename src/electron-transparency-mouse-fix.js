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

const voidFn = function(){}

module.exports = class TransparencyMouseFix {

  constructor ({
      electronWindow= require('electron').remote.getCurrentWindow(),
      htmlWindow= window,
      blackListClass= 'mouse-off',
      blackListElements= [],
      blackListSelectors= [],
      whiteListClass= 'mouse-on',
      whiteListElements= [],
      whiteListSelectors= [],
      mode= 'pointer-events',
      log= false // (...msg)=>{console.debug('%cTMF%c', 'font-weight: bold', '', ...msg)}
  }={}) {
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
    this.log = log
  }

  get log () {
    return this._log || voidFn
  }

  set log ( log ) {
    this._log = log || false
  }

  set mode ( mode ) {
    this._mode = mode = mode.toLowerCase()
    if (mode === 'pointer-events') {
      this.htmlWindow.document.documentElement.style.pointerEvents = 'none'
      this.htmlWindow.document.body.style.position = 'relative'
    } else {
      console.warn(
        '[transparency-mouse-fix]\n' +
        `  '${mode}' mode is deprecated in favor of 'pointer-events'\n` +
        '  This feature is planned for removal in version 1.0.0.')
    }
  }

  get mode () {
    return this._mode 
  }

  get htmlWindow () {return this._hWin}

  set htmlWindow ( htmlWindow ) {
    if (this._hWin) {
      this._hWin.document.removeEventListener('mousemove', this._mmListener)
      this._hWin.removeEventListener('dragover', this._doListener)
      this.htmlWindow.document.documentElement.style.pointerEvents = 'unset' // TODO: ugly
      this.htmlWindow.document.body.style.position = 'unset' // TODO: ugly
    }
    this._hWin = htmlWindow
    if (this.mode)
      this.mode = this.mode // setter; TODO: ugly; move to all-in-one (window,mode)=>{...}) 
    const onMouseEvent = e => this.onMouseEvent(e)
    this._mmListener = this._hWin.document.addEventListener('mousemove', onMouseEvent)
    this._doListener = this._hWin.addEventListener('dragover', onMouseEvent)
  }

  onMouseEvent ( event ) {
    let hole = event.target.classList.contains('etmf-hole')

    // getComputedStyle only takes 0.01ms on my PC => no performance bottleneck;

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
        var passed = this.blackListAllows(event.path)
        break
      case 'whitelist':
        var passed = this.whiteListAllows(event.path)
        break
      case 'pointer-events': // preferred method
        passed = event.target !== this.htmlWindow.document.documentElement && !hole
        break
      default:
        throw {
          msg: `Unknown mode '${this.mode}' for TransparencyMouseFix instance`,
          mode: this.mode,
          instance: this
        }
    }
    if (passed) {
      this.electronWindow.setIgnoreMouseEvents(false)
      this.log('mouse on')
    } else {
      this.electronWindow.setIgnoreMouseEvents(true, {forward: true})
      this.log('mouse off')
    }
  }

  // deprecated
  blackListAllows ( tree ) {
    for (let el of tree) {
      // skip 'global' variable
      if (!el.classList) {
        //this.log('blacklist →', el)
        continue
      }

      // match with blacklisted elements
      if (this.blackList.elements.has(el)) {
        //this.log('blacklist →', el)
        continue
      }

      // match with blacklisted className
      if (el.classList.contains(this.blackList.className)) {
        //this.log(`blacklist → .${this.blackList.className}`)
        continue
      }

      // match the element with blacklist selectors (CPU-heavy?)
      let match = this.blackList.selectors
        .find(sel => el.matches(sel))
      if (match) {
        //this.log(`blacklist → ${match}`)
        continue
      }

      this.log('blacklist ≠', el)
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
        this.log('whitelist →', el)
        return true
      }

      // match with whitelisted className
      if (el.classList.contains(this.whiteList.className)) {
        this.log(`whitelist → .${this.whiteList.className}`)
        return true
      }

      // match the element with whitelist selectors (CPU-heavy?)
      let match = this.whiteList.selectors
        .find(sel => el.matches(sel))
      if (match) {
        this.log('whiteList →', this.whiteList.selectors)
        return true
      }
    }

    return false
  }

}