# SSH Manager

> A native desktop SSH connection manager — browse hosts, open terminals, transfer files, and tweak configs without ever touching a command line.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey?style=flat-square)
![Release](https://img.shields.io/github/v/release/caspel26/ssh-manager?style=flat-square)
![Electron](https://img.shields.io/badge/electron-42-5ba7db?style=flat-square)
![Vue](https://img.shields.io/badge/vue-3-4fc08d?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-7c6af7?style=flat-square)

---

## Features

| | |
|---|---|
| **Host browser** | Reads `~/.ssh/config` and `~/.ssh/config.d/` automatically. Sorted, searchable, always up to date. |
| **Integrated terminal** | Full xterm.js terminal with multi-tab support, resize handling, and persistent sessions. |
| **Config editor** | Edit SSH host entries in guided form mode or raw text — switch between them freely. |
| **Add connections** | Paste a raw SSH config block or fill the form; add multiple hosts in one go. |
| **File transfer** | SCP and rsync with live streaming output. Built-in presets: Copy, Sync, Compressed, Dry run. |
| **Per-host commands** | Override the connect command per host — great for `tmux`, jump hosts, or custom SSH flags. |
| **Settings panel** | 8 terminal color themes, font family/size/line height, cursor style, scrollback, accent color. |

---

## Installation

### Download a release (recommended)

Go to [Releases](https://github.com/caspel26/ssh-manager/releases) and download the build for your platform:

- **macOS** → `SSHManager-x.x.x-arm64.dmg` (Apple Silicon) or `SSHManager-x.x.x-x64.dmg` (Intel)
- **Windows** → `SSHManager-x.x.x-Setup.exe`

> **macOS note:** The app is not notarized. On first launch, right-click → Open to bypass Gatekeeper.

### Build from source

```bash
# Prerequisites: Node.js 18+
git clone https://github.com/caspel26/ssh-manager.git
cd ssh-manager
npm install

# Run (builds renderer + launches Electron)
npm start

# Package
npm run package:mac   # → dist-electron/SSHManager-*.dmg
npm run package:win   # → dist-electron/SSHManager-*-Setup.exe  (Windows only)
```

---

## How it works

SSH Manager reads your existing `~/.ssh/config` — no import needed. Hosts appear in the sidebar the moment the app opens.

**Connecting** — click a host row and press **Connect**. The app spawns a PTY in the app's shell (configurable in Settings → General) and runs the connect command. Default: `ssh -A {host}`. Override it per-host in the config drawer.

**Per-host connect command** — useful if your shell auto-starts `tmux` and re-attaches on SSH. Set `tmux new -A -s {host}` as the default, or customize each host individually.

**File transfer** — open the transfer panel from the arrow icon on any host row. Choose direction (upload / download), method (scp / rsync), paths, and hit Transfer. Output streams live into the log area.

---

## Configuration

App preferences are stored at `~/.ssh_manager_prefs.json`:

```json
{
  "settings": {
    "general": {
      "defaultConnectCommand": "ssh -A {host}",
      "shell": "/bin/zsh"
    },
    "appearance": {
      "accentColor": "#7c6af7",
      "terminalTheme": "tokyoNight",
      "terminalFontSize": 13,
      "terminalFontFamily": "JetBrains Mono",
      "terminalLineHeight": 1.45,
      "terminalScrollback": 10000,
      "cursorStyle": "bar",
      "cursorBlink": true,
      "bell": "none"
    }
  },
  "hosts": {
    "my-server": {
      "connectCommand": "ssh -A -t {host} tmux new -A -s main"
    }
  }
}
```

---

## Terminal themes

Dracula · Tokyo Night · Nord · Monokai · One Dark · Gruvbox · Solarized · Default

All themes are applied live — no restart required.

---

## Releasing a new version

Tag a commit and push the tag. GitHub Actions builds both platforms and attaches the artifacts to a GitHub Release automatically:

```bash
git tag v1.1.0
git push origin v1.1.0
```

The workflow (`.github/workflows/release.yml`) runs on `macos-latest` and `windows-latest` in parallel.

---

## Tech stack

- [Electron](https://electronjs.org) 42 — app shell
- [Vue 3](https://vuejs.org) — renderer (Vite, `<script setup>`)
- [xterm.js](https://xtermjs.org) — terminal emulation
- [node-pty](https://github.com/microsoft/node-pty) — PTY process spawning
- [electron-builder](https://www.electron.build) — packaging + installers

---

## License

MIT © [caspel26](https://github.com/caspel26)
