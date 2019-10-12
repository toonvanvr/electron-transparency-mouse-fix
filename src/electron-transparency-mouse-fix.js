class PointerEventsIgnoredFix {
  #active = false
  #ignore
  #eWin

  constructor (
      active=true,
      useCache=true,
      initialState=undefined,
      rootElement=document.documentElement,
      electronWindow=require('electron').remote.getCurrentWindow(),
  ) {
    this.eventHandler = (event) => {
      if (this.#active && event.target) {
        this.ignore = event.target === this.root
        console.log(this.ignore)
      }
    }

    this.#eWin = electronWindow
    this.root = rootElement
    this.useCache = useCache
    
    if (initialState === undefined) {
      this.#ignore = undefined
      const top = this.root.getRootNode()
      if (top.readyState === 'complete') {
        console.warn('The pointer event fix should be activated on page load when initialState is not defined. Defaulting to ', this.ignore = false, '.')
      } else {
        this.ignore = true
        top.addEventListener('pointerover', this.eventHandler, {once: true})
      }
    } else {
      this.#ignore = !initialState
      this.ignore = initialState
    }

    this.active = active
  }

  get ignore () {return this.#ignore}
  get active() {return this.#active}
  
  set ignore (ignore) {
    if (!this.useCache || this.#ignore !== ignore) {
      this.#eWin.setIgnoreMouseEvents(ignore, {forward: true})
    }
    this.#ignore = ignore
  }

  set active (active) {
    if (active && !this.#active) {
      this.root.addEventListener('pointerover', this.eventHandler)
      this.root.addEventListener('pointerleave', this.eventHandler)
    } else if (!active && this.#active) {
      this.root.removeEventListener('pointerover', this.eventHandler)
      this.root.removeEventListener('pointerleave', this.eventHandler)
      this.root.getRootNode().removeEventListener('pointerover', this.eventHandler)
    }
    this.#active = active
  }
}