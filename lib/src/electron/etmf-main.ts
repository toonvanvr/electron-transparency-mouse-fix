import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { TypedEmitter } from 'tiny-typed-emitter'
import { EtmfIpcPayload } from '../common/ipc'
import type { EventEmitterLogger } from '../common/logging'
import { EtmfMainError } from './etmf-main-error'
import { EtmfHandler, EtmfMainEvents, EtmfMainOptions } from './etmf-main.types'

/**
 * Electron Transparency Mouse Fix: Electron main process injector
 *
 * @example new EtmfMain()
 */
export class EtmfMain {
  /** Customizable logging function */
  public log: EventEmitterLogger | null

  /** Active event handler receiving IPC events from the renderer */
  private registeredHandler: EtmfHandler | null = null

  /** Event emitter */
  private eventEmitter = new TypedEmitter<EtmfMainEvents>()

  /** Create an instance which you can still enable/disable */
  constructor({ enable = true, log }: EtmfMainOptions = {}) {
    this.log = log ? log : null

    // Enable a zero-config launch
    if (enable) {
      this.enable()
    }
  }

  /**
   * Register the IPC event listener
   *
   * @returns `true` unless already enabled
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
   * @returns `true` unless already disabled
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

  /** Customizable event handler */
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

  /** Emit events to the renderer through IPC */
  private emit(
    event: keyof EtmfMainEvents,
    ...args: Parameters<EtmfMainEvents[typeof event]>
  ) {
    if (this.log) {
      this.log(event as string /* lib only uses strings */, ...args)
    }
    return this.eventEmitter.emit(event, ...args)
  }
}
