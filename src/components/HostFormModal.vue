<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="overlay" @click.self="close">
        <Transition name="modal">
          <div v-if="modelValue" class="modal" role="dialog" aria-modal="true">

            <div class="modal-header">
              <div class="modal-title">
                <span class="modal-icon">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="url(#mg)" stroke-width="1.3"/>
                    <path d="M8 6v4M6 8h4" stroke="url(#mg)" stroke-width="1.3" stroke-linecap="round"/>
                    <defs>
                      <linearGradient id="mg" x1="1" y1="3" x2="15" y2="13" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#7c6af7"/>
                        <stop offset="1" stop-color="#4ecdc4"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span class="modal-title-text">New SSH Connection</span>
              </div>
              <div class="modal-header-right">
                <div class="mode-tabs">
                  <button class="mode-tab" :class="{ active: mode === 'form' }" @click="switchMode('form')">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                      <path d="M3.5 5h5M3.5 7.5h3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
                    </svg>
                    Form
                  </button>
                  <button class="mode-tab" :class="{ active: mode === 'raw' }" @click="switchMode('raw')">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <path d="M1 3l3 3-3 3M6 9h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Raw
                  </button>
                </div>
                <button class="btn-close" @click="close">
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- ── Form mode ───────────────────────────── -->
            <div v-if="mode === 'form'" class="modal-body">
              <div v-if="error" class="error-banner">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M8 5v3M8 10v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {{ error }}
              </div>

              <div class="entries-list">
                <div
                  v-for="(entry, idx) in entries"
                  :key="entry._id"
                  class="entry-card"
                  :class="{ 'entry-card--collapsed': entry._collapsed }"
                >
                  <div class="entry-header" @click="entry._collapsed = !entry._collapsed">
                    <span class="entry-num">{{ idx + 1 }}</span>
                    <span class="entry-alias">{{ entry.host.trim() || `Connection ${idx + 1}` }}</span>
                    <span v-if="entry.hostname.trim()" class="entry-meta">{{ entry.hostname.trim() }}<template v-if="entry.user.trim()"> · {{ entry.user.trim() }}</template></span>
                    <div class="entry-header-actions">
                      <svg class="entry-chevron" :class="{ open: !entry._collapsed }" viewBox="0 0 6 10" width="6" height="10" fill="none">
                        <path d="M1 1l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      <button
                        v-if="entries.length > 1"
                        class="btn-remove"
                        title="Remove connection"
                        @click.stop="removeEntry(idx)"
                      >
                        <svg viewBox="0 0 10 10" width="8" height="8" fill="none">
                          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div v-show="!entry._collapsed" class="entry-body">
                    <div class="field-group">
                      <label class="field-label" :for="`e${entry._id}-host`">Host alias <span class="required">*</span></label>
                      <input :id="`e${entry._id}-host`" v-model="entry.host" class="field-input" placeholder="my-server" autocomplete="off" spellcheck="false"/>
                    </div>
                    <div class="field-row">
                      <div class="field-group field-group--grow">
                        <label class="field-label" :for="`e${entry._id}-hostname`">HostName</label>
                        <input :id="`e${entry._id}-hostname`" v-model="entry.hostname" class="field-input" placeholder="192.168.1.1" autocomplete="off" spellcheck="false"/>
                      </div>
                      <div class="field-group field-group--port">
                        <label class="field-label" :for="`e${entry._id}-port`">Port</label>
                        <input :id="`e${entry._id}-port`" v-model="entry.port" class="field-input" placeholder="22" type="number" min="1" max="65535"/>
                      </div>
                    </div>
                    <div class="field-row">
                      <div class="field-group field-group--grow">
                        <label class="field-label" :for="`e${entry._id}-user`">User</label>
                        <input :id="`e${entry._id}-user`" v-model="entry.user" class="field-input" placeholder="username" autocomplete="off" spellcheck="false"/>
                      </div>
                      <div class="field-group field-group--grow">
                        <label class="field-label" :for="`e${entry._id}-identityfile`">IdentityFile</label>
                        <input :id="`e${entry._id}-identityfile`" v-model="entry.identityfile" class="field-input" placeholder="~/.ssh/id_rsa" autocomplete="off" spellcheck="false"/>
                      </div>
                    </div>
                    <div class="field-group">
                      <label class="field-label" :for="`e${entry._id}-proxyjump`">ProxyJump</label>
                      <input :id="`e${entry._id}-proxyjump`" v-model="entry.proxyjump" class="field-input" placeholder="jump-host alias" autocomplete="off" spellcheck="false"/>
                    </div>
                    <div class="field-group">
                      <label class="field-label" :for="`e${entry._id}-extra`">Extra options</label>
                      <textarea :id="`e${entry._id}-extra`" v-model="entry.extra" class="field-textarea" placeholder="ServerAliveInterval 60&#10;Compression yes" rows="2" spellcheck="false"/>
                    </div>
                  </div>
                </div>
              </div>

              <button class="btn-add-more" @click="addEntry">
                <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
                Add another connection
              </button>

              <div class="target-row">
                <label class="field-label" for="target-file">Save to</label>
                <select id="target-file" v-model="targetFile" class="field-select">
                  <option v-for="f in configFiles" :key="f.path" :value="f.path">{{ f.name }}</option>
                </select>
              </div>
            </div>

            <!-- ── Raw mode ────────────────────────────── -->
            <div v-else class="modal-body modal-body--raw">
              <div v-if="error" class="error-banner">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M8 5v3M8 10v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {{ error }}
              </div>

              <div class="raw-editor-card">
                <div class="raw-editor-header">
                  <span class="raw-editor-title">SSH config</span>
                  <span class="lang-badge">conf</span>
                  <span v-if="rawHostCount > 0" class="raw-count-badge">
                    {{ rawHostCount }} host{{ rawHostCount !== 1 ? 's' : '' }} detected
                  </span>
                </div>
                <div class="raw-editor-wrap">
                  <div ref="lineNumsEl" class="line-nums" aria-hidden="true">
                    <span v-for="n in rawLineCount" :key="n">{{ n }}</span>
                  </div>
                  <textarea
                    ref="rawTextarea"
                    class="code-editor"
                    v-model="rawContent"
                    spellcheck="false"
                    autocomplete="off"
                    autocorrect="off"
                    placeholder="Host my-server&#10;  HostName 192.168.1.1&#10;  User admin&#10;&#10;Host another&#10;  HostName 10.0.0.2"
                    @scroll="syncScroll"
                  ></textarea>
                </div>
                <div class="raw-editor-footer">
                  <span class="footer-info">{{ rawLineCount }} lines</span>
                  <span class="footer-info">UTF-8</span>
                </div>
              </div>

              <div class="target-row">
                <label class="field-label" for="target-file-raw">Save to</label>
                <select id="target-file-raw" v-model="targetFile" class="field-select">
                  <option v-for="f in configFiles" :key="f.path" :value="f.path">{{ f.name }}</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <div class="footer-info-left">
                <template v-if="mode === 'form'">
                  <span class="count-pill">{{ validEntryCount }} connection{{ validEntryCount !== 1 ? 's' : '' }}</span>
                </template>
              </div>
              <button class="btn-cancel" @click="close">Cancel</button>
              <button class="btn-save" @click="save" :disabled="saving || !canSave">
                <svg v-if="!saving" viewBox="0 0 12 12" width="10" height="10" fill="none">
                  <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ saving ? 'Adding…' : saveLabel }}
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'added'])

const saving = ref(false)
const error = ref(null)
const configFiles = ref([])
const targetFile = ref('')
const mode = ref('form')

let _idCounter = 0
function newEntry() {
  return { _id: ++_idCounter, _collapsed: false, host: '', hostname: '', user: '', port: '', identityfile: '', proxyjump: '', extra: '' }
}

const entries = ref([newEntry()])
const rawContent = ref('')
const lineNumsEl = ref(null)
const rawTextarea = ref(null)

const TRACKED = new Set(['hostname', 'user', 'port', 'identityfile', 'proxyjump'])

watch(() => props.modelValue, async open => {
  if (!open) return
  error.value = null
  mode.value = 'form'
  entries.value = [newEntry()]
  rawContent.value = ''
  await nextTick()
  document.querySelector('.entry-body .field-input')?.focus()
  try {
    const files = await globalThis.electronAPI.listConfigFiles()
    if (files && files.length > 0) {
      configFiles.value = files
      targetFile.value = files[0].path
    }
  } catch (e) {
    error.value = `Could not load config files: ${e.message}`
  }
})

// ── Mode switching ──────────────────────────────────────────────────

function switchMode(next) {
  if (next === mode.value) return
  if (next === 'raw') {
    rawContent.value = entriesToRaw(entries.value)
  } else {
    const parsed = parseRawToEntries(rawContent.value)
    entries.value = parsed.length > 0 ? parsed : [newEntry()]
  }
  mode.value = next
}

// ── Serialization helpers ───────────────────────────────────────────

function buildBlock(e) {
  if (!e.host.trim()) return ''
  const lines = [`Host ${e.host.trim()}`]
  if (e.hostname.trim()) lines.push(`  HostName ${e.hostname.trim()}`)
  if (e.user.trim()) lines.push(`  User ${e.user.trim()}`)
  if (e.port) lines.push(`  Port ${e.port}`)
  if (e.identityfile.trim()) lines.push(`  IdentityFile ${e.identityfile.trim()}`)
  if (e.proxyjump.trim()) lines.push(`  ProxyJump ${e.proxyjump.trim()}`)
  for (const line of e.extra.split('\n')) {
    const t = line.trim()
    if (t) lines.push(`  ${t}`)
  }
  return lines.join('\n')
}

function entriesToRaw(list) {
  return list
    .filter(e => e.host.trim())
    .map(buildBlock)
    .join('\n\n')
}

function applyKVLine(line, entry, extraLines) {
  const kv = line.match(/^(\w+)\s+(.+)$/)
  if (!kv) return
  const key = kv[1].toLowerCase()
  if (TRACKED.has(key)) entry[key] = kv[2]
  else extraLines.push(line)
}

function parseRawToEntries(raw) {
  const result = []
  let current = null
  const extraLines = []

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const hostMatch = line.match(/^Host\s+(.+)$/i)
    if (hostMatch) {
      if (current) { current.extra = extraLines.splice(0).join('\n'); result.push(current) }
      current = newEntry()
      current.host = hostMatch[1].trim()
    } else if (current) {
      applyKVLine(line, current, extraLines)
    }
  }
  if (current) { current.extra = extraLines.join('\n'); result.push(current) }
  return result.filter(e => !e.host.includes('*'))
}

// ── Entry management ────────────────────────────────────────────────

function addEntry() { entries.value.push(newEntry()) }
function removeEntry(idx) { entries.value.splice(idx, 1) }

// ── Computed ────────────────────────────────────────────────────────

const validEntryCount = computed(() => entries.value.filter(e => e.host.trim()).length)

const rawLineCount = computed(() => rawContent.value.split('\n').length)

const rawHostCount = computed(() => {
  let count = 0
  for (const line of rawContent.value.split('\n')) {
    const t = line.trim()
    if (/^Host\s+\S/i.test(t) && !t.includes('*')) count++
  }
  return count
})

const canSave = computed(() => {
  if (mode.value === 'form') return validEntryCount.value > 0
  return rawHostCount.value > 0
})

const saveLabel = computed(() => {
  if (mode.value === 'form') {
    const n = validEntryCount.value
    return n <= 1 ? 'Add connection' : `Add ${n} connections`
  }
  const n = rawHostCount.value
  return n <= 1 ? 'Add connection' : `Add ${n} connections`
})

// ── Raw editor helpers ──────────────────────────────────────────────

function syncScroll(e) {
  if (lineNumsEl.value) lineNumsEl.value.scrollTop = e.target.scrollTop
}

// ── Save ────────────────────────────────────────────────────────────

async function save() {
  error.value = null
  saving.value = true
  try {
    const block = mode.value === 'form'
      ? entriesToRaw(entries.value)
      : rawContent.value.trim()
    if (!block) return
    await globalThis.electronAPI.addHost(targetFile.value, block)
    emit('added')
    close()
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function close() { emit('update:modelValue', false) }
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal {
  width: 640px;
  max-width: 100%;
  max-height: 90vh;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ───────────────────────────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg3);
  flex-shrink: 0;
  gap: 12px;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.modal-icon {
  width: 30px;
  height: 30px;
  background: var(--grad-subtle);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 14px rgba(124,106,247,0.18);
}

.modal-title-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.modal-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.mode-tabs {
  display: flex;
  gap: 2px;
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius-pill);
  padding: 3px;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  background: none;
  border: none;
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.mode-tab:hover { color: var(--text-dim); }
.mode-tab.active {
  background: var(--surface2);
  color: var(--text);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.btn-close {
  width: 28px;
  height: 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-close:hover {
  background: rgba(248,113,113,0.12);
  color: var(--red);
  border-color: rgba(248,113,113,0.3);
}

/* ── Modal body ───────────────────────────────────────────────────── */
.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-body--raw {
  overflow: hidden;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(248,113,113,0.1);
  border: 1px solid rgba(248,113,113,0.25);
  border-radius: var(--radius);
  color: var(--red);
  font-size: 12px;
  flex-shrink: 0;
}

/* ── Entry cards ──────────────────────────────────────────────────── */
.entries-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-card {
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}
.entry-card:focus-within {
  border-color: rgba(124,106,247,0.4);
}

.entry-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid transparent;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.entry-header:hover { background: rgba(255,255,255,0.04); }
.entry-card:not(.entry-card--collapsed) .entry-header {
  border-bottom-color: var(--border);
}

.entry-num {
  width: 18px;
  height: 18px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent-l);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 50%;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.entry-alias {
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.entry-meta {
  font-size: 11px;
  font-family: 'SF Mono', monospace;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.entry-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.entry-chevron {
  color: var(--text-muted);
  transform: rotate(0deg);
  transition: transform 0.18s ease;
  opacity: 0.5;
}
.entry-chevron.open { transform: rotate(90deg); }

.btn-remove {
  width: 22px;
  height: 22px;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-remove:hover {
  background: rgba(248,113,113,0.12);
  color: var(--red);
  border-color: rgba(248,113,113,0.25);
}

.entry-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Form fields ──────────────────────────────────────────────────── */
.field-row {
  display: flex;
  gap: 8px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-group--grow { flex: 1; min-width: 0; }
.field-group--port { width: 82px; flex-shrink: 0; }

.field-label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.01em;
}

.required {
  color: var(--accent-l);
  margin-left: 2px;
}

.field-input,
.field-select {
  height: 32px;
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 12px;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  padding: 0 9px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}
.field-input::placeholder { color: var(--text-muted); }
.field-input:focus,
.field-select:focus {
  border-color: rgba(124,106,247,0.55);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg4));
  box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
}
.field-select { cursor: pointer; }

.field-textarea {
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 12px;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  padding: 7px 9px;
  outline: none;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.6;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.field-textarea::placeholder { color: var(--text-muted); }
.field-textarea:focus {
  border-color: rgba(124,106,247,0.55);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg4));
  box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
}

/* ── Add more button ──────────────────────────────────────────────── */
.btn-add-more {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 9px 14px;
  background: none;
  border: 1px dashed var(--border2);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-add-more:hover {
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  color: var(--accent-l);
  border-color: rgba(124,106,247,0.4);
  border-style: solid;
}

/* ── Target file row ──────────────────────────────────────────────── */
.target-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.target-row .field-label {
  flex-shrink: 0;
  font-size: 11px;
}
.target-row .field-select {
  flex: 1;
}

/* ── Raw editor ───────────────────────────────────────────────────── */
.raw-editor-card {
  flex: 1;
  min-height: 0;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.raw-editor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 34px;
  background: var(--bg4);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.raw-editor-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}

.lang-badge {
  background: color-mix(in srgb, var(--cyan) 12%, transparent);
  color: var(--cyan);
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid color-mix(in srgb, var(--cyan) 25%, transparent);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.raw-count-badge {
  margin-left: auto;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent-l);
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
}

.raw-editor-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.7;
  background: #07070f;
  overflow: hidden;
}

.line-nums {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 12px 10px 12px 8px;
  color: rgba(120,120,160,0.4);
  font-size: 11px;
  line-height: 1.7;
  user-select: none;
  flex-shrink: 0;
  border-right: 1px solid rgba(124,106,247,0.1);
  background: #050510;
  min-width: 40px;
  overflow: hidden;
}
.line-nums span { display: block; }

.code-editor {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: #d4d4f0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  caret-color: var(--accent);
  overflow: auto;
  white-space: pre;
}
.code-editor::placeholder {
  color: rgba(120,120,160,0.35);
  font-style: italic;
}

.raw-editor-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  height: 22px;
  background: var(--bg4);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.footer-info {
  font-size: 10px;
  color: rgba(120,120,160,0.5);
  font-family: 'SF Mono', monospace;
}

/* ── Footer ───────────────────────────────────────────────────────── */
.modal-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg3);
  flex-shrink: 0;
}

.footer-info-left {
  flex: 1;
}

.count-pill {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border2);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.btn-cancel {
  background: var(--surface);
  color: var(--text-dim);
  border: 1px solid var(--border2);
  border-radius: var(--radius-pill);
  font-size: 12px;
  padding: 7px 16px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.btn-cancel:hover {
  background: var(--surface2);
  border-color: var(--border3);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--grad-btn);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  padding: 7px 18px;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity var(--transition);
}
.btn-save:hover:not(:disabled) { opacity: 0.82; }
.btn-save:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── Transitions ──────────────────────────────────────────────────── */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.modal-enter-active { transition: opacity 0.2s, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.modal-leave-active { transition: opacity 0.15s, transform 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }
</style>
