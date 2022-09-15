import { EtmfPreloader } from '../../lib/dist/renderer/etmf-preloader'

new EtmfPreloader({ log: console.log })

/**
 * Compiled with rollup:
 *   /demo/src/preload.js -> /demo/preload.js
 *
 * see /package.json::scripts['build:demo'] for more info
 */
