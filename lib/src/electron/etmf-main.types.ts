import type { BrowserWindow, IpcMainEvent } from 'electron'
import type { EtmfIpcPayload } from '../common/ipc'
import type { EventEmitterLogger } from '../common/logging'
import { EtmfMain } from './etmf-main'

/** Typed Events for {@link EtmfMain} which is an EventEmitter */
export interface EtmfMainEvents {
  'enabled': (enabled: boolean) => void
  'ignore-mouse': (ignored: boolean, window: BrowserWindow) => void
}

export interface EtmfMainOptions {
  enable?: boolean
  log?: EventEmitterLogger | false
}

export type EtmfHandler = (
  event: IpcMainEvent,
  { ignored }: EtmfIpcPayload,
) => void
