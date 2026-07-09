<template>
  <div class="terminal-wrap">

    <div class="tabs-bar">
      <div class="tabs-scroll">
        <button
          v-for="s in sessions"
          :key="s.id"
          class="tab"
          :class="{ active: s.id === activeId }"
          @click="setActive(s.id)"
        >
          <span class="tab-status" :class="{ connected: s.connected }"></span>
          <span class="tab-label">{{ s.label }}</span>
          <span class="tab-close" @click.stop="closeSession(s.id)">
            <svg viewBox="0 0 10 10" width="8" height="8" fill="none">
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
        </button>
      </div>
      <div v-if="sessions.length === 0" class="tabs-hint">
        No sessions — connect to a host
      </div>
    </div>

    <div class="terminals">
      <div
        v-for="s in sessions"
        :key="s.id"
        :ref="el => setTermRef(s.id, el)"
        class="terminal-container"
        :class="{ visible: s.id === activeId }"
      ></div>

      <Transition name="fade">
        <div v-if="sessions.length === 0" class="terminal-empty">
          <div class="empty-glow"></div>
          <svg class="empty-icon" viewBox="0 0 48 48" width="52" height="52" fill="none">
            <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <path d="M12 20l6 4-6 4M22 28h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
          </svg>
          <p class="empty-title">No active sessions</p>
          <p class="empty-sub">Select a host from the sidebar and click <strong>Connect</strong></p>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { TERMINAL_THEMES } from '../composables/useSettings.js'
import { Terminal } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { useSessions } from '../composables/useSessions.js'
import { useSettings } from '../composables/useSettings.js'
import 'xterm/css/xterm.css'

const { sessions, activeId, closeSession, setActive } = useSessions()
const { settings } = useSettings()

const termElMap = {}
const terms = {}

function setTermRef(id, el) {
  if (el) termElMap[id] = el
  else delete termElMap[id]
}

watch(
  () => sessions.value.map(s => s.id),
  async (curIds, prevIds) => {
    const prev = new Set(prevIds || [])
    for (const id of curIds) {
      if (!prev.has(id) && !terms[id]) {
        await nextTick()
        const s = sessions.value.find(x => x.id === id)
        if (s) bootTerminal(s)
      }
    }
    const cur = new Set(curIds)
    for (const id of Object.keys(terms)) {
      if (!cur.has(id)) destroyTerminal(id)
    }
  }
)

watch(activeId, async (id) => {
  if (!id) return
  await nextTick()
  terms[id]?.fitAddon.fit()
})

// Apply appearance changes live to all open terminals
watch(() => settings.value.appearance, (appearance) => {
  const themeKey = appearance.terminalTheme ?? 'default'
  const themeColors = (TERMINAL_THEMES[themeKey] ?? TERMINAL_THEMES.default).colors
  const fontFamily = `"${appearance.terminalFontFamily}", "SF Mono", "JetBrains Mono", Menlo, monospace`
  for (const { term, fitAddon } of Object.values(terms)) {
    term.options.theme = themeColors
    term.options.fontFamily = fontFamily
    term.options.fontSize = appearance.terminalFontSize ?? 13
    term.options.lineHeight = appearance.terminalLineHeight ?? 1.45
    term.options.cursorStyle = appearance.cursorStyle ?? 'bar'
    term.options.cursorBlink = appearance.cursorBlink ?? true
    fitAddon.fit()
  }
}, { deep: true })

async function bootTerminal(session) {
  let el = termElMap[session.id]
  if (!el) { await nextTick(); el = termElMap[session.id] }
  if (!el) return

  const appearance = settings.value.appearance
  const themeKey = appearance.terminalTheme ?? 'default'
  const themeColors = (TERMINAL_THEMES[themeKey] ?? TERMINAL_THEMES.default).colors
  const term = new Terminal({
    fontFamily: `"${appearance.terminalFontFamily}", "SF Mono", "JetBrains Mono", Menlo, monospace`,
    fontSize: appearance.terminalFontSize ?? 13,
    lineHeight: appearance.terminalLineHeight ?? 1.45,
    cursorBlink: appearance.cursorBlink ?? true,
    cursorStyle: appearance.cursorStyle ?? 'bar',
    bellStyle: appearance.bell === 'sound' ? 'sound' : appearance.bell === 'visual' ? 'visual' : 'none',
    theme: themeColors,
    allowTransparency: true,
    scrollback: appearance.terminalScrollback ?? 10000,
  })

  const fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.loadAddon(new WebLinksAddon())
  term.open(el)
  fitAddon.fit()

  await window.electronAPI.createPty(session.id, session.host)

  const offData = window.electronAPI.onPtyData(session.id, d => term.write(d))
  const offExit = window.electronAPI.onPtyExit(session.id, () => {
    term.writeln('\r\n\x1b[2m── session ended ──\x1b[0m')
    const s = sessions.value.find(x => x.id === session.id)
    if (s) s.connected = false
  })

  term.onData(d => window.electronAPI.writePty(session.id, d))

  const ro = new ResizeObserver(() => {
    try { fitAddon.fit(); window.electronAPI.resizePty(session.id, term.cols, term.rows) } catch {}
  })
  ro.observe(el)

  const s = sessions.value.find(x => x.id === session.id)
  if (s) s.connected = true

  terms[session.id] = { terminal: term, fitAddon, cleanup: () => { offData(); offExit(); ro.disconnect() } }
}

function destroyTerminal(id) {
  const t = terms[id]
  if (!t) return
  t.cleanup(); t.terminal.dispose()
  delete terms[id]
}

onUnmounted(() => { for (const id of Object.keys(terms)) destroyTerminal(id) })
</script>

<style scoped>
.terminal-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
}

.tabs-bar {
  display: flex;
  align-items: center;
  height: 44px;
  flex-shrink: 0;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
  padding: 0 10px;
  gap: 4px;
}

.tabs-scroll {
  display: flex;
  align-items: center;
  overflow-x: auto;
  flex: 1;
  gap: 4px;
  height: 100%;
  padding: 6px 0;
}
.tabs-scroll::-webkit-scrollbar { height: 0; }

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 11px;
  height: 32px;
  min-width: 110px;
  max-width: 180px;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-size: 11px;
  font-family: 'SF Mono', monospace;
  cursor: pointer;
  transition: background var(--transition), color var(--transition), border-color var(--transition), box-shadow var(--transition);
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
}
.tab:hover {
  background: var(--surface2);
  color: var(--text-dim);
  border-color: var(--border3);
}
.tab.active {
  background: var(--surface2);
  color: var(--text);
  border-color: var(--border3);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}

.tab-status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border2);
  flex-shrink: 0;
  transition: background var(--transition), box-shadow var(--transition);
}
.tab-status.connected {
  background: var(--green);
}

.tab-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.tab-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: var(--text-muted);
  opacity: 0;
  transition: background var(--transition-fast), color var(--transition-fast), opacity var(--transition-fast);
}
.tab:hover .tab-close { opacity: 1; }
.tab-close:hover {
  background: rgba(248,113,113,0.2);
  color: var(--red);
}

.tabs-hint {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.terminals {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.terminal-container {
  position: absolute;
  inset: 0;
  padding: 8px 8px 6px;
  display: none;
}
.terminal-container.visible { display: block; }

.terminal-container :deep(.xterm) { height: 100%; }
.terminal-container :deep(.xterm-screen) { height: 100%; }

.terminal-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  pointer-events: none;
}

.empty-glow { display: none; }

.empty-icon {
  color: var(--accent);
  opacity: 0.35;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-dim);
}

.empty-sub {
  font-size: 12px;
  color: var(--text-muted);
  max-width: 280px;
  text-align: center;
  line-height: 1.6;
}
.empty-sub strong { color: var(--accent-l); font-weight: 600; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
