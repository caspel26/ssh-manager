# SSH Manager

A desktop SSH connection manager built with Electron + Vue 3.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey)
![Electron](https://img.shields.io/badge/electron-42-blue)
![Vue](https://img.shields.io/badge/vue-3-green)

## Features

- **SSH host browser** — reads your `~/.ssh/config` (and `~/.ssh/config.d/`) automatically
- **Integrated terminal** — full xterm.js terminal with tab support
- **Config editor** — form and raw mode for editing SSH host configs
- **Add connections** — form or raw paste mode, supports multiple hosts at once
- **File transfer** — SCP and rsync with live output and presets (Copy / Sync / Dry run)
- **Per-host connect commands** — customize the launch command per host (e.g. tmux, custom SSH flags)
- **Settings panel** — terminal themes (Dracula, Nord, Tokyo Night, Monokai, One Dark, Gruvbox, Solarized), font, cursor, scrollback, accent color

## Requirements

- Node.js 18+
- macOS or Windows 10+ (with OpenSSH)

## Getting started

```bash
npm install
npm start          # build + launch in dev mode
```

## Build

```bash
npm run package        # macOS DMG (arm64)
npm run package:win    # Windows NSIS installer (x64, requires Windows or cross-compile toolchain)
```

Output goes to `dist/`.

## Settings storage

User preferences are saved to `~/.ssh_manager_prefs.json`. Per-host connect commands are stored in the same file under `.hosts[alias].connectCommand`.

## License

MIT
