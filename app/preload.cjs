'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  listHosts:      ()                   => ipcRenderer.invoke('ssh:list'),
  getHostConfig:  (hostName)           => ipcRenderer.invoke('ssh:getConfig', hostName),
  saveHostConfig: (filePath, content)  => ipcRenderer.invoke('ssh:saveConfig', { filePath, content }),
  listConfigFiles: ()                  => ipcRenderer.invoke('ssh:listConfigFiles'),
  addHost: (filePath, block)           => ipcRenderer.invoke('ssh:addHost', { filePath, block }),
  getHostPref:  (hostName)             => ipcRenderer.invoke('ssh:getHostPref', hostName),
  saveHostPref: (hostName, pref)       => ipcRenderer.invoke('ssh:saveHostPref', { hostName, pref }),
  getPrefs:     ()                     => ipcRenderer.invoke('prefs:get'),
  savePrefs:    (patch)                => ipcRenderer.invoke('prefs:save', patch),

  openPath:        (opts)      => ipcRenderer.invoke('dialog:open', opts),
  startTransfer:   (id, opts)  => ipcRenderer.invoke('transfer:start', { id, ...opts }),
  cancelTransfer:  (id)        => ipcRenderer.send('transfer:cancel', id),
  onTransferOutput: (id, cb) => {
    const ch = `transfer:output:${id}`
    const fn = (_, d) => cb(d)
    ipcRenderer.on(ch, fn)
    return () => ipcRenderer.removeListener(ch, fn)
  },
  onTransferDone: (id, cb) => {
    const ch = `transfer:done:${id}`
    const fn = (_, d) => cb(d)
    ipcRenderer.on(ch, fn)
    return () => ipcRenderer.removeListener(ch, fn)
  },

  createPty:  (id, host)       => ipcRenderer.invoke('pty:create', { id, host }),
  writePty:   (id, data)       => ipcRenderer.send('pty:write',  { id, data }),
  resizePty:  (id, cols, rows) => ipcRenderer.send('pty:resize', { id, cols, rows }),
  killPty:    (id)             => ipcRenderer.send('pty:kill',   { id }),

  onPtyData: (id, cb) => {
    const ch = `pty:data:${id}`
    const fn = (_, d) => cb(d)
    ipcRenderer.on(ch, fn)
    return () => ipcRenderer.removeListener(ch, fn)
  },
  onPtyExit: (id, cb) => {
    const ch = `pty:exit:${id}`
    const fn = () => cb()
    ipcRenderer.on(ch, fn)
    return () => ipcRenderer.removeListener(ch, fn)
  },
})
