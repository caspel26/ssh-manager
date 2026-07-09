const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Host list
  listHosts: () => ipcRenderer.invoke('ssh:list'),

  // SSH config view/edit
  getHostConfig: (hostName) => ipcRenderer.invoke('ssh:getConfig', hostName),
  saveHostConfig: (filePath, content) => ipcRenderer.invoke('ssh:saveConfig', { filePath, content }),
  listConfigFiles: () => ipcRenderer.invoke('ssh:listConfigFiles'),
  addHost: (filePath, block) => ipcRenderer.invoke('ssh:addHost', { filePath, block }),

  // PTY
  createPty:  (id, host)         => ipcRenderer.invoke('pty:create', { id, host }),
  writePty:   (id, data)         => ipcRenderer.send('pty:write',  { id, data }),
  resizePty:  (id, cols, rows)   => ipcRenderer.send('pty:resize', { id, cols, rows }),
  killPty:    (id)               => ipcRenderer.send('pty:kill',   { id }),

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
