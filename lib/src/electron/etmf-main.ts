import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { TypedEmitter } from 'tiny-typed-emitter'
import { EtmfIpcPayload } from '../common/ipc'
import type { EventEmitterLogger } from '../common/logging'
import { EtmfMainError } from './etmf-main-error'

/** Typed Events for {@link EtmfMain} which is an EventEmitter */
export interface EtmfMainEvents {
  'enabled': (enabled: boolean) => void
  'ignore-mouse': (ignored: boolean, window: BrowserWindow) => void
}

export interface EtmfMainOptions {
  enable?: boolean
  log?: EventEmitterLogger | false
}

/**
 * Electron Transparency Mouse Fix: Electron main process injector
 *
 * @example new EtmfMain()
 */
export class EtmfMain extends TypedEmitter<EtmfMainEvents> {
  public registeredHandler: typeof this['handler'] | null = null
  log: EventEmitterLogger | null

  constructor({ enable = true, log }: EtmfMainOptions = {}) {
    super()

    this.log = log ? log : null

    // Enable a zero-config launch
    if (enable) {
      this.enable()
    }
  }

  emit(
    event: keyof EtmfMainEvents,
    ...args: Parameters<EtmfMainEvents[typeof event]>
  ) {
    if (this.log) {
      this.log(event as string /* lib only uses strings */, ...args)
    }
    return super.emit(event, ...args)
  }

  /**
   * Register the IPC event listener
   *
   * @returns `true` if it wasn't enabled yet
   * @returns `false` if it already was enabled
   */
  public enable(): boolean {
    if (this.registeredHandler) {
      // Don't reactivate if it's already enabled
      return false
    } else {
      const handler = this.handler.bind(this)
      ipcMain.on('etmf', handler)
      this.registeredHandler = handler
      this.emit('enabled', true)
      return true
    }
  }

  /**
   * Unregister the IPC event listener
   *
   * @returns `true` if it was enabled before
   * @returns `false` if it was aleady turned off
   */
  public disable(): boolean {
    if (this.registeredHandler) {
      ipcMain.off('etmf', this.registeredHandler)
      this.registeredHandler = null
      this.emit('enabled', false)
      return true
    } else {
      return false
    }
  }

  // can not set return type to type guard 'is true' :(
  /** Is the main process handling IPC events from renderers? */
  get enabled(): boolean {
    return Boolean(this.registeredHandler)
  }

  public handler(event: IpcMainEvent, { ignored }: EtmfIpcPayload): void {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.setIgnoreMouseEvents(ignored, { forward: true })
      this.emit('ignore-mouse', ignored, window)
    } else {
      throw new EtmfMainError(
        'Cannot find reference to BrowserWindow which just sent an event',
      )
    }
  }
}
