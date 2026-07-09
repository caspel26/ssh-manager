import { ref } from 'vue'

export const TERMINAL_THEMES = {
  default: {
    label: 'Default',
    colors: {
      background: '#0d0d14', foreground: '#eaeaf4',
      cursor: '#7c6af7', cursorAccent: '#0d0d14',
      selectionBackground: 'rgba(124,106,247,0.25)',
      black: '#1e1e2e', red: '#f87171', green: '#4ade80', yellow: '#fbbf24',
      blue: '#5eaeff', magenta: '#f472b6', cyan: '#4fd6be', white: '#eaeaf4',
      brightBlack: '#44445a', brightRed: '#fca5a5', brightGreen: '#86efac',
      brightYellow: '#fde68a', brightBlue: '#93c5fd', brightMagenta: '#f9a8d4',
      brightCyan: '#99f6e4', brightWhite: '#f8f8ff',
    },
  },
  dracula: {
    label: 'Dracula',
    colors: {
      background: '#282a36', foreground: '#f8f8f2',
      cursor: '#f8f8f2', cursorAccent: '#282a36',
      selectionBackground: 'rgba(98,114,164,0.4)',
      black: '#21222c', red: '#ff5555', green: '#50fa7b', yellow: '#f1fa8c',
      blue: '#bd93f9', magenta: '#ff79c6', cyan: '#8be9fd', white: '#f8f8f2',
      brightBlack: '#6272a4', brightRed: '#ff6e6e', brightGreen: '#69ff94',
      brightYellow: '#ffffa5', brightBlue: '#d6acff', brightMagenta: '#ff92df',
      brightCyan: '#a4ffff', brightWhite: '#ffffff',
    },
  },
  tokyoNight: {
    label: 'Tokyo Night',
    colors: {
      background: '#1a1b26', foreground: '#a9b1d6',
      cursor: '#c0caf5', cursorAccent: '#1a1b26',
      selectionBackground: 'rgba(122,162,247,0.25)',
      black: '#15161e', red: '#f7768e', green: '#9ece6a', yellow: '#e0af68',
      blue: '#7aa2f7', magenta: '#bb9af7', cyan: '#7dcfff', white: '#a9b1d6',
      brightBlack: '#414868', brightRed: '#f7768e', brightGreen: '#9ece6a',
      brightYellow: '#e0af68', brightBlue: '#7aa2f7', brightMagenta: '#bb9af7',
      brightCyan: '#7dcfff', brightWhite: '#c0caf5',
    },
  },
  nord: {
    label: 'Nord',
    colors: {
      background: '#2e3440', foreground: '#d8dee9',
      cursor: '#d8dee9', cursorAccent: '#2e3440',
      selectionBackground: 'rgba(67,76,94,0.6)',
      black: '#3b4252', red: '#bf616a', green: '#a3be8c', yellow: '#ebcb8b',
      blue: '#81a1c1', magenta: '#b48ead', cyan: '#88c0d0', white: '#e5e9f0',
      brightBlack: '#4c566a', brightRed: '#bf616a', brightGreen: '#a3be8c',
      brightYellow: '#ebcb8b', brightBlue: '#81a1c1', brightMagenta: '#b48ead',
      brightCyan: '#8fbcbb', brightWhite: '#eceff4',
    },
  },
  monokai: {
    label: 'Monokai',
    colors: {
      background: '#272822', foreground: '#f8f8f2',
      cursor: '#f8f8f0', cursorAccent: '#272822',
      selectionBackground: 'rgba(117,113,94,0.4)',
      black: '#272822', red: '#f92672', green: '#a6e22e', yellow: '#f4bf75',
      blue: '#66d9ef', magenta: '#ae81ff', cyan: '#a1efe4', white: '#f8f8f2',
      brightBlack: '#75715e', brightRed: '#f92672', brightGreen: '#a6e22e',
      brightYellow: '#f4bf75', brightBlue: '#66d9ef', brightMagenta: '#ae81ff',
      brightCyan: '#a1efe4', brightWhite: '#f9f8f5',
    },
  },
  oneDark: {
    label: 'One Dark',
    colors: {
      background: '#282c34', foreground: '#abb2bf',
      cursor: '#528bff', cursorAccent: '#282c34',
      selectionBackground: 'rgba(62,68,82,0.6)',
      black: '#282c34', red: '#e06c75', green: '#98c379', yellow: '#e5c07b',
      blue: '#61afef', magenta: '#c678dd', cyan: '#56b6c2', white: '#abb2bf',
      brightBlack: '#5c6370', brightRed: '#e06c75', brightGreen: '#98c379',
      brightYellow: '#e5c07b', brightBlue: '#61afef', brightMagenta: '#c678dd',
      brightCyan: '#56b6c2', brightWhite: '#ffffff',
    },
  },
  gruvbox: {
    label: 'Gruvbox',
    colors: {
      background: '#282828', foreground: '#ebdbb2',
      cursor: '#ebdbb2', cursorAccent: '#282828',
      selectionBackground: 'rgba(80,73,69,0.6)',
      black: '#282828', red: '#cc241d', green: '#98971a', yellow: '#d79921',
      blue: '#458588', magenta: '#b16286', cyan: '#689d6a', white: '#a89984',
      brightBlack: '#928374', brightRed: '#fb4934', brightGreen: '#b8bb26',
      brightYellow: '#fabd2f', brightBlue: '#83a598', brightMagenta: '#d3869b',
      brightCyan: '#8ec07c', brightWhite: '#ebdbb2',
    },
  },
  solarized: {
    label: 'Solarized',
    colors: {
      background: '#002b36', foreground: '#839496',
      cursor: '#839496', cursorAccent: '#002b36',
      selectionBackground: 'rgba(7,54,66,0.6)',
      black: '#073642', red: '#dc322f', green: '#859900', yellow: '#b58900',
      blue: '#268bd2', magenta: '#d33682', cyan: '#2aa198', white: '#eee8d5',
      brightBlack: '#002b36', brightRed: '#cb4b16', brightGreen: '#586e75',
      brightYellow: '#657b83', brightBlue: '#839496', brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1', brightWhite: '#fdf6e3',
    },
  },
}

export const DEFAULTS = {
  general: {
    defaultConnectCommand: 'ssh -A {host}',
    shell: '',
  },
  appearance: {
    theme: 'dark',            // 'dark' | 'light'
    accentColor: '#7c6af7',
    uiDensity: 'comfortable', // 'comfortable' | 'compact'
    terminalTheme: 'default',
    terminalFontSize: 13,
    terminalFontFamily: 'SF Mono',
    terminalLineHeight: 1.45,
    terminalScrollback: 10000,
    cursorStyle: 'bar',
    cursorBlink: true,
    bell: 'none',
  },
}

function deepMerge(base, patch) {
  const out = { ...base }
  for (const k of Object.keys(patch ?? {})) {
    if (patch[k] !== null && typeof patch[k] === 'object' && !Array.isArray(patch[k])) {
      out[k] = deepMerge(base[k] ?? {}, patch[k])
    } else if (patch[k] !== null && patch[k] !== undefined) {
      out[k] = patch[k]
    }
  }
  return out
}

export const ACCENT_PRESETS = [
  { label: 'Purple',  value: '#7c6af7' },
  { label: 'Indigo',  value: '#6366f1' },
  { label: 'Blue',    value: '#60a5fa' },
  { label: 'Sky',     value: '#38bdf8' },
  { label: 'Teal',    value: '#2dd4bf' },
  { label: 'Emerald', value: '#34d399' },
  { label: 'Green',   value: '#4ade80' },
  { label: 'Lime',    value: '#a3e635' },
  { label: 'Amber',   value: '#fbbf24' },
  { label: 'Orange',  value: '#fb923c' },
  { label: 'Rose',    value: '#fb7185' },
  { label: 'Pink',    value: '#f472b6' },
]

export const FONT_FAMILIES = [
  { label: 'SF Mono',        value: 'SF Mono' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono' },
  { label: 'Fira Code',      value: 'Fira Code' },
  { label: 'Menlo',          value: 'Menlo' },
  { label: 'Consolas',       value: 'Consolas' },
]

const settings = ref(deepMerge(DEFAULTS, {}))

export function applyAppearance(appearance) {
  const el = document.documentElement
  // Theme (dark/light) + density drive token sets defined in style.css
  el.setAttribute('data-theme', appearance.theme ?? DEFAULTS.appearance.theme)
  el.setAttribute('data-density', appearance.uiDensity ?? DEFAULTS.appearance.uiDensity)

  const hex = appearance.accentColor ?? DEFAULTS.appearance.accentColor
  el.style.setProperty('--accent',    hex)
  el.style.setProperty('--accent-l',  lighten(hex, 18))
  el.style.setProperty('--accent-d',  darken(hex, 20))
  el.style.setProperty('--accent-contrast', bestContrast(hex))
  el.style.setProperty('--grad-btn',  hex)
  el.style.setProperty('--grad-accent', `linear-gradient(135deg, ${hex} 0%, ${lighten(hex, 12)} 100%)`)
  el.style.setProperty('--grad-subtle', hexToRgba(hex, 0.11))
  // alpha helpers so components don't need to hardcode the hue
  el.style.setProperty('--accent-08',  hexToRgba(hex, 0.08))
  el.style.setProperty('--accent-12',  hexToRgba(hex, 0.12))
  el.style.setProperty('--accent-20',  hexToRgba(hex, 0.20))
  el.style.setProperty('--accent-28',  hexToRgba(hex, 0.28))
  el.style.setProperty('--accent-35',  hexToRgba(hex, 0.35))
  el.style.setProperty('--accent-55',  hexToRgba(hex, 0.55))
}

// Pick black/white text for best contrast on the given accent (WCAG luminance)
function bestContrast(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) / 255, g = ((n >> 8) & 0xff) / 255, b = (n & 0xff) / 255
  const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return L > 0.45 ? '#0d0d18' : '#ffffff'
}

function lighten(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, (n >> 16) + amount)
  const g = Math.min(255, ((n >> 8) & 0xff) + amount)
  const b = Math.min(255, (n & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function darken(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - amount)
  const g = Math.max(0, ((n >> 8) & 0xff) - amount)
  const b = Math.max(0, (n & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16)
  const r = n >> 16, g = (n >> 8) & 0xff, b = n & 0xff
  return `rgba(${r},${g},${b},${alpha})`
}

export function useSettings() {
  async function load() {
    try {
      const prefs = await globalThis.electronAPI.getPrefs()
      if (prefs?.settings) settings.value = deepMerge(DEFAULTS, prefs.settings)
      applyAppearance(settings.value.appearance)
    } catch { /* first launch or no IPC */ }
  }

  async function save() {
    try {
      await globalThis.electronAPI.savePrefs({ settings: settings.value })
      applyAppearance(settings.value.appearance)
    } catch { /* ignore */ }
  }

  // Flip theme instantly and persist (used by the header toggle)
  async function toggleTheme() {
    settings.value.appearance.theme = settings.value.appearance.theme === 'light' ? 'dark' : 'light'
    applyAppearance(settings.value.appearance)
    await save()
  }

  return { settings, load, save, toggleTheme, applyAppearance }
}
