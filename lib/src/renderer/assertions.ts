import type { ipcRenderer } from 'electron'
import { EtmfRendererError } from './etmf-renderer-error'

/** Throw an error if you don't have access to {@link ipcRenderer} */
export function assertAccessToIpc() {
  if ('require' in window) {
    let cause: any = null
    let fail = true
    try {
      const electron = require('electron')
      if (electron) {
        return
      }
    } catch (cause) {}
    const error = new EtmfRendererError('Failed to import electron', { cause })
    throw error
  } else {
    throw new EtmfRendererError(
      'window.require is not defined. This must be called in a preload script or a BrowserWindow with nodeIntegration enabled',
    )
  }
}
