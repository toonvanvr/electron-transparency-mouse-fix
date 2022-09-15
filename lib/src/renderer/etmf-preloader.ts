// TODO: split into preloader and renderer. We're handling an
// ipcRenderer object instead of accessing through an API like
// in the electron docs.

import { ipcRenderer } from 'electron'
import { TypedEmitter } from 'tiny-typed-emitter'
import { EtmfIpcPayload } from '../common/ipc.js'
import { EventEmitterLogger } from '../common/logging.js'
import { EtmfRendererError } from './etmf-renderer-error'
/**
 * The HTMLElement ID attribute of injected css
 *
 * @example <style id="{{ etmfStyleElementId }}">
 */
export const etmfStyleElementId = 'etmf-css'

/**
 * CSS selectors for Electron Transparency Mouse Fix
 */
export interface EtmfCssSelectors {
  /**
   * This element should ignore mouse events
   *
   * @default '.etmf-ignore'
   */
  ignoreSelector?: string

  /**
   * This element should accept mouse events
   *
   * @default '.etmf-accept'
   */
  acceptSelector?: string
}

const etmfDefaultCssSelectors: Required<EtmfCssSelectors> = {
  acceptSelector: '.etmf-accept',
  ignoreSelector: '.etmf-ignore',
}

/** Options object for the {@link EtmfPreloader} constructor */
export interface EtmfPreloaderOptions {
  enable?: boolean
  injectCss?: boolean | EtmfCssSelectors
  log?: EventEmitterLogger
}

/** Typed Events for {@link EtmfPreloader} which is an EventEmitter */
export interface EtmfPreloaderEvents {
  'ignore-mouse': (ignored: boolean) => void
  'body-event-listeners': (enabled: boolean) => void
  'inject-css': (injected: boolean) => void
}

/** Electron Transparency Mouse Fix: Electron renderer process injector */
export class EtmfPreloader extends TypedEmitter<EtmfPreloaderEvents> {
  injectCssEnabled: boolean
  registeredHandler: typeof this['handler'] | null = null
  cssIgnoreSelector: string
  cssAcceptSelector: string
  log: EventEmitterLogger | null

  constructor({
    enable = true,
    injectCss = true,
    log,
  }: EtmfPreloaderOptions = {}) {
    super()
    this.log = log ? log : null
    this.injectCssEnabled = Boolean(injectCss)
    const { acceptSelector, ignoreSelector } =
      typeof injectCss === 'object' ? injectCss : ({} as EtmfCssSelectors)
    this.cssIgnoreSelector =
      ignoreSelector ?? etmfDefaultCssSelectors.ignoreSelector
    this.cssAcceptSelector =
      acceptSelector ?? etmfDefaultCssSelectors.acceptSelector

    if (enable) {
      this.enable()
    }
  }

  emit(
    event: keyof EtmfPreloaderEvents,
    ...args: Parameters<EtmfPreloaderEvents[typeof event]>
  ) {
    if (this.log) {
      this.log(event as string /* lib only uses strings */, ...args)
    }
    return super.emit(event, ...args)
  }

  /** Register mouse event listeners which send IPC calls */
  enable({ injectCss = this.injectCssEnabled } = {}): boolean {
    // Don't reactivate if it's already enabled
    if (this.registeredHandler) {
      return false
    }

    this.registeredHandler = this.handler.bind(this)
    if (document.body) {
      this.initEtmf({ injectCss })
    } else {
      window.addEventListener('load', () => {
        this.initEtmf({ injectCss })
      })
    }
    return true
  }

  /** Register event listeners and inject css */
  private initEtmf({ injectCss = this.injectCssEnabled } = {}): void {
    this.captureFirstMouse()
    if (injectCss) {
      this.injectCss()
    }
    this.registerBodyEventListeners()
  }

  /**
   * Capture the first mouse event if the window is still loading.
   *
   * If this is skipped, you need to move the mouse before it knows whether
   * you're on the window, which would mean you'd have to start from a
   * 'ignored' mouse event state. I want to avoid this because the
   * setIgnoreMouseEvents API is not at all consistent among OSes, versions
   * and behaves differently when devtools are opened. You might end up with
   * a bugged window which doesn't accept any mouse event ever.
   */
  private captureFirstMouse(): void {
    // The event listener only emits before body is loaded, no use after
    if (!document.body) {
      // assert correct state
      if (this.registeredHandler) {
        // Register it to trigger only once.
        // For the rest, we only want body events
        document.addEventListener('mouseenter', this.registeredHandler, {
          once: true,
        })
      } else {
        throw new EtmfRendererError(
          'DEV ERROR: EtmfPreloader.registeredHandler is not set',
        )
      }
    }
  }

  /**
   * Register the minimal amount of event listeners to trigger all cases of
   * events which may require toggling {@link BrowserWindow.setIgnoreMouseEvents}
   */
  private registerBodyEventListeners(): void {
    if (document.body) {
      if (this.registeredHandler) {
        document.body.addEventListener('mouseenter', this.registeredHandler)
        document.body.addEventListener('mouseleave', this.registeredHandler)
        this.emit('body-event-listeners', true)
      } else {
        throw new EtmfRendererError(
          'DEV ERROR: EtmfPreloader.registeredHandler is not set',
        )
      }
    } else {
      throw new EtmfRendererError(
        'Missing document.body property. Did you call this function before document.onload?',
      )
    }
  }

  /**
   * Listen to mouse events to trigger {@link BrowserWindow.setIgnoreMouseEvents}
   * to the main process
   */
  public handler(event: MouseEvent) {
    const ignored = event.target === document || event.type === 'mouseleave'
    document.documentElement.classList.toggle(`etmf-ignore`, ignored)
    const payload: EtmfIpcPayload = { ignored }
    ipcRenderer.send('etmf', payload)
    this.emit('ignore-mouse', ignored)
  }

  /**
   * Inject Electron Transparency Mouse Fix CSS classes
   *
   * - `.etmf-ignore` -- or overridden by param
   * - `.etmf-accept` -- or overridden by param
   *
   * @returns `true` when new CSS is injected
   * @returns `false` in case the CSS already existed
   */
  injectCss({
    ignoreSelector = this.cssIgnoreSelector,
    acceptSelector = this.cssAcceptSelector,
  } = {}): boolean {
    if (document.head) {
      if (document.getElementById(etmfStyleElementId)) {
        return false
      } else {
        const style = document.createElement('style')
        style.id = 'etmf-css'
        style.innerHTML = `
          ${ignoreSelector}, :root { pointer-events: none }
          ${acceptSelector} { pointer-events: all }
        `
        document.head.appendChild(style)
        this.emit('inject-css', true)
        return true
      }
    } else {
      throw new EtmfRendererError(
        'Missing document.head property. Did you call this function before document.onload?',
      )
    }
  }
}
