import { contextBridge } from 'electron'
import { EtmfPreloader } from '../../../lib/dist/renderer/etmf-preloader'


contextBridge.exposeInMainWorld('etmf', new EtmfPreloader({ log: console.log }))