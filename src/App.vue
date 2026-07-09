<template>
  <div class="app" @mousemove="onDrag" @mouseup="stopDrag" :class="{ dragging }">

    <div class="titlebar">
      <div class="tl-space"></div>
      <div class="tl-center">
        <div class="tl-logo">
          <svg viewBox="0 0 18 18" width="15" height="15" fill="none">
            <rect x="1" y="4" width="16" height="11" rx="2" stroke="url(#g)" stroke-width="1.4"/>
            <path d="M5 9l3 2.5L5 14" stroke="url(#g)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 13h4" stroke="url(#g)" stroke-width="1.4" stroke-linecap="round"/>
            <defs>
              <linearGradient id="g" x1="1" y1="4" x2="17" y2="15" gradientUnits="userSpaceOnUse">
                <stop stop-color="#7c6af7"/>
                <stop offset="1" stop-color="#4ecdc4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="tl-name">SSH Manager</span>
      </div>
      <div class="tl-right">
        <div class="host-chip">
          <span class="chip-dot"></span>
          {{ hosts.length }} hosts
        </div>
        <button class="btn-settings" title="Settings" @click="settingsOpen = true">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const { hosts, load, reload } = useHosts()
const { openSession } = useSessions()
const { addModalOpen } = useModals()
const { load: loadSettings } = useSettings()
const settingsOpen = ref(false)
onMounted(() => { load(); loadSettings() })

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
}
.app.dragging { cursor: col-resize; }

.titlebar {
  display: flex;
  align-items: center;
  height: 48px;
  flex-shrink: 0;
  -webkit-app-region: drag;
  background: var(--bg2);
  position: relative;
  padding: 0 16px 0 0;
}

.titlebar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: var(--border);
}

.tl-space { width: 80px; flex-shrink: 0; }

.tl-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 9px;
  -webkit-app-region: no-drag;
}

.tl-logo {
  width: 30px;
  height: 30px;
  background: var(--grad-subtle);
  border: 1px solid var(--border2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tl-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.tl-right {
  margin-left: auto;
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-settings {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-settings:hover {
  background: var(--surface2);
  color: var(--text);
  border-color: var(--border3);
}

.host-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--surface);
  padding: 4px 11px 4px 9px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border2);
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
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
  background: var(--bg2);
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
  box-shadow: 0 0 10px rgba(124,106,247,0.5);
  width: 2px;
}

.terminal-area {
  flex: 1;
  overflow: hidden;
}
</style>
