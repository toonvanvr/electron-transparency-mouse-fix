import type { EventEmitterLogger } from '../common/logging'
import type { EtmfPreloader } from './etmf-preloader'

/** CSS selectors for Electron Transparency Mouse Fix */
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

/** Options object for the {@link EtmfPreloader} constructor */
export interface EtmfPreloaderOptions {
  enable?: boolean
  injectCss?: boolean | EtmfCssSelectors
  log?: EventEmitterLogger
}
