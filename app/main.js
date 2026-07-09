import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import os from 'os'
import pty from 'node-pty'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  const ROOT = app.getAppPath()
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f0f17',
    webPreferences: {
      preload: join(ROOT, 'dist-electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    vibrancy: 'under-window',
    visualEffectState: 'active',
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(ROOT, 'dist/index.html'))
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// ─── SSH Config helpers ───────────────────────────────────────────────────────

const SSH_DIR = join(os.homedir(), '.ssh')
const CONFIG_MAIN = join(SSH_DIR, 'config')
const CONFIG_D = join(SSH_DIR, 'config.d')

function parseConfigText(text) {
  const hosts = []
  let current = null
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const hostMatch = line.match(/^Host\s+(.+)$/i)
    if (hostMatch) {
      if (current) hosts.push(current)
      current = { host: hostMatch[1].trim() }
    } else if (current) {
      const kv = line.match(/^(\w+)\s+(.+)$/)
      if (kv) {
        const key = kv[1].toLowerCase()
        if (!(key in current)) current[key] = kv[2].trim()
      }
    }
  }
  if (current) hosts.push(current)
  return hosts
}

function loadSSHHosts() {
  const texts = []
  if (existsSync(CONFIG_MAIN)) texts.push(readFileSync(CONFIG_MAIN, 'utf8'))
  if (existsSync(CONFIG_D)) {
    for (const f of readdirSync(CONFIG_D).sort((a, b) => a.localeCompare(b))) {
      texts.push(readFileSync(join(CONFIG_D, f), 'utf8'))
    }
  }
  const seen = new Set()
  const result = []
  for (const text of texts) {
    for (const h of parseConfigText(text)) {
      if (h.host.includes('*') || seen.has(h.host)) continue
      seen.add(h.host)
      result.push(h)
    }
  }
  return result.sort((a, b) => a.host.localeCompare(b.host))
}

// Returns the raw config file text + which file a host lives in
function findHostFile(hostName) {
  const files = []
  if (existsSync(CONFIG_MAIN)) files.push({ path: CONFIG_MAIN, name: '~/.ssh/config' })
  if (existsSync(CONFIG_D)) {
    for (const f of readdirSync(CONFIG_D).sort((a, b) => a.localeCompare(b))) {
      files.push({ path: join(CONFIG_D, f), name: `~/.ssh/config.d/${f}` })
    }
  }

  for (const file of files) {
    const text = readFileSync(file.path, 'utf8')
    const re = new RegExp(`^Host\\s+${hostName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im')
    if (re.test(text)) return { ...file, content: text }
  }
  return null
}

ipcMain.handle('ssh:list', () => loadSSHHosts())

ipcMain.handle('ssh:getConfig', (_, hostName) => {
  return findHostFile(hostName)
})

ipcMain.handle('ssh:saveConfig', (_, { filePath, content }) => {
  writeFileSync(filePath, content, 'utf8')
  return { ok: true }
})

ipcMain.handle('ssh:listConfigFiles', () => {
  const files = []
  if (existsSync(CONFIG_MAIN)) files.push({ path: CONFIG_MAIN, name: '~/.ssh/config' })
  if (existsSync(CONFIG_D)) {
    for (const f of readdirSync(CONFIG_D).sort()) {
      files.push({ path: join(CONFIG_D, f), name: `~/.ssh/config.d/${f}` })
    }
  }
  if (files.length === 0) files.push({ path: CONFIG_MAIN, name: '~/.ssh/config' })
  return files
})

ipcMain.handle('ssh:addHost', (_, { filePath, block }) => {
  let content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
  if (content && !content.endsWith('\n')) content += '\n'
  content += '\n' + block + '\n'
  writeFileSync(filePath, content, 'utf8')
  return { ok: true }
})

// ─── PTY / Terminal sessions ──────────────────────────────────────────────────

const sessions = new Map()

ipcMain.handle('pty:create', (event, { id, host }) => {
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash'
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 120,
    rows: 36,
    cwd: os.homedir(),
    env: { ...process.env, TERM: 'xterm-256color' },
  })

  sessions.set(id, ptyProcess)

  ptyProcess.onData(data => {
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send(`pty:data:${id}`, data)
  })

  ptyProcess.onExit(() => {
    sessions.delete(id)
    if (!mainWindow.isDestroyed()) mainWindow.webContents.send(`pty:exit:${id}`)
  })

  if (host) setTimeout(() => ptyProcess.write(`ssh ${host}\r`), 300)

  return { pid: ptyProcess.pid }
})

ipcMain.on('pty:write',  (_, { id, data })       => { sessions.get(id)?.write(data) })
ipcMain.on('pty:resize', (_, { id, cols, rows })  => { sessions.get(id)?.resize(cols, rows) })
ipcMain.on('pty:kill',   (_, { id })              => { const p = sessions.get(id); if (p) { p.kill(); sessions.delete(id) } })
