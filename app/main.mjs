// In packaged Electron app (no node_modules/electron), Electron's native ESM 
// loader handles 'import from electron' as a builtin.
// In dev mode (node_modules/electron exists), we get the npm package path string.
// The app is packaged via electron-builder which excludes node_modules/electron.
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { spawn, execSync } from 'child_process'
import os from 'os'
import pty from 'node-pty'

// GUI apps launched from Finder don't inherit the shell's SSH_AUTH_SOCK, so
// ssh can't reach the agent and prompts for a password on every connection.
// On macOS the agent socket lives in launchd; fall back to that when unset.
function resolveAuthSock() {
  if (process.env.SSH_AUTH_SOCK) return process.env.SSH_AUTH_SOCK
  if (process.platform === 'darwin') {
    try {
      const sock = execSync('launchctl getenv SSH_AUTH_SOCK', { encoding: 'utf8' }).trim()
      if (sock) return sock
    } catch { /* no agent registered with launchd */ }
  }
  return ''
}
const SSH_AUTH_SOCK = resolveAuthSock()

const isDev = process.env.NODE_ENV === 'development'
let mainWindow

app.commandLine.appendSwitch('no-sandbox')
// Don't use the macOS Keychain ("Safe Storage") for Chromium's local encryption.
// The app is ad-hoc signed, so each build looks like a new app and macOS would
// re-prompt for the keychain password. We store prefs as plain JSON, no secrets.
app.commandLine.appendSwitch('password-store', 'basic')

function createWindow() {
  const ROOT = app.getAppPath()
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0d0d18',
    webPreferences: {
      preload: join(ROOT, 'app/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(ROOT, 'dist/index.html'))
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
// On macOS `activate` can fire before the app is ready on first launch — guard against it.
app.on('activate', () => {
  if (app.isReady() && BrowserWindow.getAllWindows().length === 0) createWindow()
})

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
    for (const f of readdirSync(CONFIG_D).sort()) {
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

function findHostFile(hostName) {
  const files = []
  if (existsSync(CONFIG_MAIN)) files.push({ path: CONFIG_MAIN, name: '~/.ssh/config' })
  if (existsSync(CONFIG_D)) {
    for (const f of readdirSync(CONFIG_D).sort()) {
      files.push({ path: join(CONFIG_D, f), name: `~/.ssh/config.d/${f}` })
    }
  }
  for (const file of files) {
    const content = readFileSync(file.path, 'utf8')
    const re = new RegExp(`^Host\\s+${hostName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im')
    if (re.test(content)) return { ...file, content }
  }
  return null
}

ipcMain.handle('ssh:list', () => loadSSHHosts())
ipcMain.handle('ssh:getConfig', (_, hostName) => findHostFile(hostName))
ipcMain.handle('ssh:saveConfig', (_, { filePath, content }) => {
  writeFileSync(filePath, content, 'utf8')
  return { ok: true }
})

ipcMain.handle('ssh:listConfigFiles', () => {
  const files = []
  if (existsSync(CONFIG_MAIN)) files.push({ path: CONFIG_MAIN, name: '~/.ssh/config' })
  if (existsSync(CONFIG_D)) {
    for (const f of readdirSync(CONFIG_D).sort((a, b) => a.localeCompare(b))) {
      files.push({ path: join(CONFIG_D, f), name: `~/.ssh/config.d/${f}` })
    }
  }
  if (files.length === 0) files.push({ path: CONFIG_MAIN, name: '~/.ssh/config' })
  return files
})

// ─── Per-host preferences ─────────────────────────────────────────────────────

const PREFS_FILE = join(os.homedir(), '.ssh_manager_prefs.json')

function loadPrefs() {
  try { return existsSync(PREFS_FILE) ? JSON.parse(readFileSync(PREFS_FILE, 'utf8')) : {} } catch { return {} }
}

function savePrefs(prefs) {
  writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2), 'utf8')
}

ipcMain.handle('prefs:get', () => loadPrefs())
ipcMain.handle('prefs:save', (_, patch) => {
  const prefs = loadPrefs()
  const merged = { ...prefs, ...patch, hosts: prefs.hosts ?? {} }
  savePrefs(merged)
  return { ok: true }
})

ipcMain.handle('ssh:getHostPref', (_, hostName) => {
  const prefs = loadPrefs()
  return prefs.hosts?.[hostName] ?? {}
})

ipcMain.handle('ssh:saveHostPref', (_, { hostName, pref }) => {
  const prefs = loadPrefs()
  if (!prefs.hosts) prefs.hosts = {}
  prefs.hosts[hostName] = { ...(prefs.hosts[hostName] ?? {}), ...pref }
  savePrefs(prefs)
  return { ok: true }
})

ipcMain.handle('ssh:addHost', (_, { filePath, block }) => {
  let content = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
  if (content && !content.endsWith('\n')) content += '\n'
  content += '\n' + block + '\n'
  writeFileSync(filePath, content, 'utf8')
  return { ok: true }
})

// ─── PTY sessions ─────────────────────────────────────────────────────────────

const sessions = new Map()
const isWin = process.platform === 'win32'

ipcMain.handle('pty:create', (event, { id, host }) => {
  const prefs = loadPrefs()
  const defaultShell = isWin
    ? (process.env.COMSPEC || 'powershell.exe')
    : (process.env.SHELL || '/bin/bash')
  const shell = prefs.settings?.general?.shell || defaultShell
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 120,
    rows: 36,
    cwd: os.homedir(),
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      ...(!isWin && SSH_AUTH_SOCK ? { SSH_AUTH_SOCK } : {}),
    },
    useConpty: isWin,
  })
  sessions.set(id, ptyProcess)
  ptyProcess.onData(data => { if (!mainWindow.isDestroyed()) mainWindow.webContents.send(`pty:data:${id}`, data) })
  ptyProcess.onExit(() => { sessions.delete(id); if (!mainWindow.isDestroyed()) mainWindow.webContents.send(`pty:exit:${id}`) })
  if (host) {
    const prefs = loadPrefs()
    const template =
      prefs.hosts?.[host]?.connectCommand ||
      prefs.settings?.general?.defaultConnectCommand ||
      'ssh -A {host}'
    const cmd = template.replace(/\{host\}/g, host)
    setTimeout(() => ptyProcess.write(cmd + '\r'), 300)
  }
  return { pid: ptyProcess.pid }
})

ipcMain.on('pty:write',  (_, { id, data })      => { sessions.get(id)?.write(data) })
ipcMain.on('pty:resize', (_, { id, cols, rows }) => { sessions.get(id)?.resize(cols, rows) })
ipcMain.on('pty:kill',   (_, { id })             => { const p = sessions.get(id); if (p) { p.kill(); sessions.delete(id) } })

// ─── File dialog ───────────────────────────────────────────────────────────────

ipcMain.handle('dialog:open', async (_, opts) => {
  return dialog.showOpenDialog(mainWindow, opts)
})

// ─── File transfer (scp / rsync) ──────────────────────────────────────────────

const activeTransfers = new Map()

ipcMain.handle('transfer:start', (_, { id, host, direction, localPath, remotePath, method, rsyncOpts }) => {
  const remote = `${host}:${remotePath}`
  let cmd, args

  if (method === 'rsync') {
    const flags = (rsyncOpts || '-av --progress').trim().split(/\s+/).filter(Boolean)
    cmd = 'rsync'
    args = direction === 'upload' ? [...flags, localPath, remote] : [...flags, remote, localPath]
  } else {
    cmd = 'scp'
    args = direction === 'upload' ? ['-r', localPath, remote] : ['-r', remote, localPath]
  }

  const proc = spawn(cmd, args, {
    env: { ...process.env, ...(SSH_AUTH_SOCK ? { SSH_AUTH_SOCK } : {}) },
  })
  activeTransfers.set(id, proc)

  const send = data => { if (!mainWindow.isDestroyed()) mainWindow.webContents.send(`transfer:output:${id}`, data) }
  proc.stdout.on('data', d => send(d.toString()))
  proc.stderr.on('data', d => send(d.toString()))
  proc.on('error', err => { send(`Error: ${err.message}\n`); mainWindow.webContents.send(`transfer:done:${id}`, { code: 1 }) })
  proc.on('close', code => { activeTransfers.delete(id); if (!mainWindow.isDestroyed()) mainWindow.webContents.send(`transfer:done:${id}`, { code }) })

  return { ok: true }
})

ipcMain.on('transfer:cancel', (_, id) => { activeTransfers.get(id)?.kill(); activeTransfers.delete(id) })
