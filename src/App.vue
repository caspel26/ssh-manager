<template>
  <div class="app" @mousemove="onDrag" @mouseup="stopDrag" :class="{ dragging }">

    <div class="titlebar">
      <div class="tl-space"></div>
      <div class="tl-right">
        <div class="host-chip" :class="{ live: activeCount > 0 }" :title="`${hosts.length} configured hosts${activeCount ? ` · ${activeCount} active session${activeCount === 1 ? '' : 's'}` : ''}`">
          <span class="chip-dot"></span>
          <span class="chip-count">{{ hosts.length }}</span>
          <span class="chip-label">{{ hosts.length === 1 ? 'host' : 'hosts' }}</span>
          <template v-if="activeCount > 0">
            <span class="chip-sep">·</span>
            <span class="chip-active">{{ activeCount }} active</span>
          </template>
        </div>
        <button class="btn-icon" :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'" @click="toggleTheme">
          <svg v-if="isDark" viewBox="0 0 16 16" width="15" height="15" fill="none">
            <path d="M13.5 9.2A5.2 5.2 0 016.8 2.5a5.5 5.5 0 100 11 5.5 5.5 0 006.7-4.3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
          </svg>
          <svg v-else viewBox="0 0 16 16" width="15" height="15" fill="none">
            <circle cx="8" cy="8" r="3.2" stroke="currentColor" stroke-width="1.3"/>
            <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3 3l1.1 1.1M11.9 11.9L13 13M3 13l1.1-1.1M11.9 4.1L13 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="btn-icon" title="Settings" @click="settingsOpen = true">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
            <path d="M2 4.5h5.2M10.8 4.5H14M2 11.5h3.2M8.8 11.5H14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            <circle cx="9" cy="4.5" r="1.7" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="7" cy="11.5" r="1.7" stroke="currentColor" stroke-width="1.4"/>
          </svg>
        </button>
        <div v-if="!isMac" class="tl-win-space"></div>
      </div>
    </div>

    <div class="body">
      <aside class="sidebar" :style="{ width: sidebarWidth + 'px' }">
        <HostList @connect="connect" @config="openConfig" @transfer="openTransfer" />
      </aside>

      <div class="resize-handle" @mousedown.prevent="startDrag"></div>

      <main class="terminal-area">
        <TerminalPane />
      </main>
    </div>

    <ConfigDrawer v-model="drawerOpen" :host-name="drawerHost" />
    <HostFormModal v-model="addModalOpen" @added="onHostAdded" />
    <SettingsModal v-model="settingsOpen" />
    <TransferModal v-model="transferOpen" :host-name="transferHost" />

    <span class="app-version">v{{ version }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HostList from './components/HostList.vue'
import TerminalPane from './components/TerminalPane.vue'
import ConfigDrawer from './components/ConfigDrawer.vue'
import HostFormModal from './components/HostFormModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import TransferModal from './components/TransferModal.vue'
import { useHosts } from './composables/useHosts.js'
import { useSessions } from './composables/useSessions.js'
import { useModals } from './composables/useModals.js'
import { useSettings } from './composables/useSettings.js'
import { useHostPrefs } from './composables/useHostPrefs.js'

const { hosts, load, reload } = useHosts()
const { load: loadHostPrefs } = useHostPrefs()
const { openSession, sessions } = useSessions()
const { addModalOpen } = useModals()
const { settings, load: loadSettings, toggleTheme } = useSettings()
const settingsOpen = ref(false)
const version = __APP_VERSION__

const activeCount = computed(() => sessions.value.length)
const isDark = computed(() => (settings.value.appearance.theme ?? 'dark') !== 'light')
const isMac = window.electronAPI?.platform === 'darwin'

onMounted(() => { load(); loadSettings(); loadHostPrefs() })

function connect(host) { openSession(host) }

const drawerOpen = ref(false)
const drawerHost = ref('')
function openConfig(host) { drawerHost.value = host; drawerOpen.value = true }

async function onHostAdded() { await reload() }

const transferOpen = ref(false)
const transferHost = ref('')
function openTransfer(host) { transferHost.value = host; transferOpen.value = true }

const sidebarWidth = ref(288)
const dragging = ref(false)
const dragStartX = ref(0)
const dragStartW = ref(0)

function startDrag(e) { dragging.value = true; dragStartX.value = e.clientX; dragStartW.value = sidebarWidth.value }
function onDrag(e) {
  if (!dragging.value) return
  sidebarWidth.value = Math.min(480, Math.max(200, dragStartW.value + e.clientX - dragStartX.value))
}
function stopDrag() { dragging.value = false }
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  position: relative;
}
.app.dragging { cursor: col-resize; }

.titlebar {
  display: flex;
  align-items: center;
  height: 46px;
  flex-shrink: 0;
  -webkit-app-region: drag;
  background: var(--bg2);
  position: relative;
  padding: 0 12px 0 0;
}

.titlebar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border) 12%, var(--border) 88%, transparent);
}

.tl-space { width: 74px; flex-shrink: 0; }

/* Reserves room for Windows/Linux's overlaid min/max/close buttons (titleBarOverlay) */
.tl-win-space { width: 138px; flex-shrink: 0; }

.tl-right {
  margin-left: auto;
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  gap: 6px;
}

.host-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  background: transparent;
  padding: 4px 11px 4px 9px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.host-chip:hover {
  border-color: var(--border2);
  background: var(--overlay);
}
.chip-count {
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}
.chip-label { color: var(--text-muted); }
.chip-sep { color: var(--text-muted); opacity: 0.5; }
.chip-active {
  color: var(--green);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.chip-dot {
  position: relative;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: background var(--transition);
}
.host-chip.live .chip-dot { background: var(--green); }
.chip-dot::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--green);
  opacity: 0;
}
.host-chip.live .chip-dot::after {
  animation: chip-pulse 2.4s ease-out infinite;
}
@keyframes chip-pulse {
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(2.6); opacity: 0; }
  100% { transform: scale(2.6); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .chip-dot::after { animation: none; }
}

.btn-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}
.btn-icon:hover {
  background: var(--surface);
  color: var(--text);
}
.btn-icon:active { transform: scale(0.9); }

.app-version {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 10px;
  font-family: 'SF Mono', ui-monospace, monospace;
  color: var(--text-muted);
  opacity: 0.5;
  letter-spacing: 0.02em;
  pointer-events: none;
  z-index: 5;
  -webkit-app-region: no-drag;
}

.body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--bg2) 0%, color-mix(in srgb, var(--bg2) 96%, var(--accent)) 100%);
  overflow: hidden;
}

.resize-handle {
  width: 1px;
  flex-shrink: 0;
  background: var(--border);
  cursor: col-resize;
  position: relative;
  z-index: 10;
  transition: background var(--transition-fast), width var(--transition-fast);
}
.resize-handle:hover,
.resize-handle:active {
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent-55);
  width: 2px;
}

.terminal-area {
  flex: 1;
  overflow: hidden;
}
</style>
