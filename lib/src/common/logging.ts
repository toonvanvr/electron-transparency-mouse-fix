import type { DefaultListener, ListenerSignature } from 'tiny-typed-emitter'

export type EventEmitterLogger<
  L extends ListenerSignature<L> = DefaultListener,
> = (event: keyof L, ...args: Parameters<L[typeof event]>) => boolean
