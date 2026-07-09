<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="overlay" @click.self="maybeClose">
        <Transition name="modal">
          <div v-if="modelValue" class="modal" role="dialog" aria-modal="true">

            <div class="modal-header">
              <div class="modal-title">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <path d="M8 2v12M4 10l4 4 4-4M4 6l4-4 4 4" stroke="url(#tg)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  <defs>
                    <linearGradient id="tg" x1="4" y1="2" x2="12" y2="14" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#7c6af7"/><stop offset="1" stop-color="#4ecdc4"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span>Transfer — <code class="host-chip">{{ hostName }}</code></span>
              </div>
              <button class="btn-close" @click="maybeClose" :disabled="running">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">

              <!-- Direction + method row -->
              <div class="top-row">
                <div class="pill-group">
                  <button class="pill" :class="{ active: direction === 'upload' }" @click="direction = 'upload'" :disabled="running">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <path d="M6 9V2M3 5l3-3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 10h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
                    </svg>
                    Upload
                  </button>
                  <button class="pill" :class="{ active: direction === 'download' }" @click="direction = 'download'" :disabled="running">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <path d="M6 3v7M3 7l3 3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 2h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
                    </svg>
                    Download
                  </button>
                </div>

                <div class="method-pills">
                  <span class="method-label">via</span>
                  <button class="pill pill--sm" :class="{ active: method === 'scp' }" @click="method = 'scp'" :disabled="running">scp</button>
                  <button class="pill pill--sm" :class="{ active: method === 'rsync' }" @click="method = 'rsync'" :disabled="running">rsync</button>
                </div>
              </div>

              <!-- rsync options -->
              <div v-if="method === 'rsync'" class="rsync-section">
                <div class="presets">
                  <span class="field-label">Preset</span>
                  <button
                    v-for="p in rsyncPresets" :key="p.label"
                    class="preset-btn" :class="{ active: rsyncOpts === p.flags }"
                    :title="p.desc" :disabled="running"
                    @click="rsyncOpts = p.flags"
                  >{{ p.label }}</button>
                </div>
                <div class="field">
                  <label class="field-label" for="t-rsync-opts">Flags</label>
                  <input id="t-rsync-opts" v-model="rsyncOpts" class="field-input field-input--mono" :disabled="running" spellcheck="false"/>
                  <span class="field-hint">Tip: trailing <code>/</code> on local path syncs the <em>contents</em>; without it, rsync copies the folder itself.</span>
                </div>
              </div>

              <!-- Paths -->
              <div class="paths">
                <div class="path-block" :class="{ 'path-block--primary': direction === 'upload' }">
                  <div class="path-header">
                    <span class="path-tag">Local</span>
                    <span v-if="direction === 'upload'" class="path-source-badge">source</span>
                    <span v-else class="path-dest-badge">destination</span>
                  </div>
                  <div class="path-row">
                    <input v-model="localPath" class="field-input field-input--mono" placeholder="/Users/me/files/" :disabled="running" spellcheck="false"/>
                    <button class="btn-browse" @click="browse" :disabled="running">
                      <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
                        <path d="M2 4a1 1 0 011-1h3l1.5 1.5H11a1 1 0 011 1V10a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" stroke-width="1.2"/>
                      </svg>
                      Browse
                    </button>
                  </div>
                </div>

                <div class="path-arrow">
                  <svg v-if="direction === 'upload'" viewBox="0 0 20 12" width="20" height="12" fill="none">
                    <path d="M1 6h16M13 2l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 20 12" width="20" height="12" fill="none">
                    <path d="M19 6H3M7 2L3 6l4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>

                <div class="path-block" :class="{ 'path-block--primary': direction === 'download' }">
                  <div class="path-header">
                    <span class="path-tag path-tag--remote">Remote · {{ hostName }}</span>
                    <span v-if="direction === 'download'" class="path-source-badge">source</span>
                    <span v-else class="path-dest-badge">destination</span>
                  </div>
                  <input v-model="remotePath" class="field-input field-input--mono" placeholder="/home/user/files/" :disabled="running" spellcheck="false"/>
                </div>
              </div>

              <!-- Output log -->
              <div class="output-section">
                <div class="output-header">
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                    <path d="M1 3l3 3-3 3M6 9h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Output
                  <span v-if="done" class="exit-badge" :class="exitCode === 0 ? 'exit-ok' : 'exit-err'">
                    {{ exitCode === 0 ? 'Completed' : `Exited ${exitCode}` }}
                  </span>
                  <div v-if="running" class="spinner"></div>
                  <button v-if="output" class="btn-clear" @click="output = ''" :disabled="running">Clear</button>
                </div>
                <div ref="outputEl" class="output-log">
                  <span v-if="!output" class="output-placeholder">Output will appear here…</span>
                  <span v-else class="output-text">{{ output }}</span>
                </div>
              </div>

            </div>

            <div class="modal-footer">
              <button v-if="running" class="btn-cancel-transfer" @click="cancel">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                  <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" opacity=".7"/>
                </svg>
                Stop
              </button>
              <button v-else class="btn-cancel" @click="maybeClose">Close</button>
              <button class="btn-transfer" @click="start" :disabled="running || !canStart">
                <svg v-if="!running" viewBox="0 0 12 12" width="10" height="10" fill="none">
                  <path d="M3 2l7 4-7 4V2z" fill="currentColor"/>
                </svg>
                <div v-else class="spinner-sm"></div>
                {{ running ? 'Transferring…' : 'Transfer' }}
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

const props = defineProps({ modelValue: Boolean, hostName: String })
const emit = defineEmits(['update:modelValue'])

const direction = ref('upload')
const method = ref('scp')
const rsyncOpts = ref('-av --progress')

const rsyncPresets = [
  { label: 'Copy',       flags: '-av --progress',                desc: 'Copy files, keep existing destination files' },
  { label: 'Sync',       flags: '-av --delete --progress',       desc: 'Mirror source → delete files on destination that no longer exist on source' },
  { label: 'Compressed', flags: '-avz --progress',               desc: 'Copy with compression (good for slow links)' },
  { label: 'Dry run',    flags: '-av --dry-run --progress',      desc: 'Simulate transfer without writing anything' },
]
const localPath = ref('')
const remotePath = ref('')
const output = ref('')
const running = ref(false)
const done = ref(false)
const exitCode = ref(null)
const outputEl = ref(null)

let transferId = null
let cleanupOutput = null
let cleanupDone = null

watch(() => props.modelValue, open => {
  if (open) {
    direction.value = 'upload'
    method.value = 'scp'
    localPath.value = ''
    remotePath.value = ''
    output.value = ''
    running.value = false
    done.value = false
    exitCode.value = null
  } else {
    cleanup()
  }
})

const canStart = computed(() =>
  localPath.value.trim() !== '' && remotePath.value.trim() !== ''
)

async function browse() {
  const isUpload = direction.value === 'upload'
  const result = await globalThis.electronAPI.openPath({
    properties: isUpload ? ['openFile', 'openDirectory', 'multiSelections'] : ['openDirectory', 'createDirectory'],
    message: isUpload ? 'Select files or folder to upload' : 'Select destination folder',
    buttonLabel: isUpload ? 'Select' : 'Choose Destination',
  })
  if (!result.canceled && result.filePaths.length > 0) {
    localPath.value = result.filePaths.length === 1
      ? result.filePaths[0]
      : result.filePaths.join(' ')
  }
}

async function start() {
  if (!canStart.value || running.value) return
  output.value = ''
  done.value = false
  exitCode.value = null
  running.value = true

  transferId = `t-${Date.now()}`

  cleanupOutput = globalThis.electronAPI.onTransferOutput(transferId, data => {
    output.value += data
    nextTick(() => {
      if (outputEl.value) outputEl.value.scrollTop = outputEl.value.scrollHeight
    })
  })

  cleanupDone = globalThis.electronAPI.onTransferDone(transferId, ({ code }) => {
    running.value = false
    done.value = true
    exitCode.value = code
    cleanup()
  })

  await globalThis.electronAPI.startTransfer(transferId, {
    host: props.hostName,
    direction: direction.value,
    localPath: localPath.value.trim(),
    remotePath: remotePath.value.trim(),
    method: method.value,
    rsyncOpts: rsyncOpts.value,
  })
}

function cancel() {
  if (transferId) globalThis.electronAPI.cancelTransfer(transferId)
  running.value = false
  done.value = true
  exitCode.value = -1
  output.value += '\n[cancelled]\n'
  cleanup()
}

function cleanup() {
  cleanupOutput?.(); cleanupOutput = null
  cleanupDone?.(); cleanupDone = null
}

function maybeClose() {
  if (running.value) return
  emit('update:modelValue', false)
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 350;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}

.modal {
  width: 660px; max-width: 100%; max-height: 90vh;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Header */
.modal-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg3); flex-shrink: 0;
}
.modal-title {
  flex: 1; display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: var(--text);
}
.host-chip {
  font-family: 'SF Mono', monospace;
  font-size: 12px; font-weight: 500;
  color: var(--accent-l);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: var(--radius); padding: 1px 7px;
}
.btn-close {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text-muted); cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-close:hover:not(:disabled) { background: rgba(248,113,113,0.12); color: var(--red); border-color: rgba(248,113,113,0.3); }
.btn-close:disabled { opacity: 0.35; cursor: not-allowed; }

/* Body */
.modal-body {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 16px; display: flex; flex-direction: column; gap: 14px;
}

/* Top row */
.top-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.method-pills { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.method-label { font-size: 11px; color: var(--text-muted); }

/* Pills */
.pill-group { display: flex; gap: 3px; background: var(--bg4); border: 1px solid var(--border2); border-radius: var(--radius-pill); padding: 3px; }
.pill {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 14px; background: none; border: none; border-radius: var(--radius-pill);
  color: var(--text-muted); font-size: 12px; font-weight: 500; cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.pill:hover:not(:disabled) { color: var(--text-dim); }
.pill.active { background: var(--surface2); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.pill--sm { padding: 4px 10px; font-size: 11px; font-family: 'SF Mono', monospace; }
.pill:disabled { opacity: 0.45; cursor: not-allowed; }

/* Field */
.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 10.5px; font-weight: 600; color: var(--text-dim); }
.field-input {
  height: 32px; background: var(--bg4); border: 1px solid var(--border2);
  border-radius: var(--radius); color: var(--text); font-size: 12px;
  padding: 0 10px; outline: none; width: 100%; box-sizing: border-box;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.field-input--mono { font-family: 'SF Mono', 'JetBrains Mono', monospace; }
.field-input::placeholder { color: var(--text-muted); }
.field-input:focus { border-color: rgba(124,106,247,0.55); box-shadow: 0 0 0 3px rgba(124,106,247,0.1); background: color-mix(in srgb, var(--accent) 5%, var(--bg4)); }
.field-input:disabled { opacity: 0.5; cursor: not-allowed; }

/* Paths */
.paths {
  display: flex; align-items: center; gap: 10px;
}
.path-block {
  flex: 1; min-width: 0;
  background: var(--bg3); border: 1px solid var(--border2);
  border-radius: var(--radius-lg); padding: 10px 12px;
  display: flex; flex-direction: column; gap: 8px;
  transition: border-color var(--transition-fast);
}
.path-block--primary { border-color: color-mix(in srgb, var(--accent) 35%, transparent); }

.path-header { display: flex; align-items: center; gap: 6px; }
.path-tag {
  font-size: 9.5px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-muted);
}
.path-tag--remote { color: var(--cyan); }
.path-source-badge {
  font-size: 9px; font-weight: 700; padding: 1px 6px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent-l);
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
}
.path-dest-badge {
  font-size: 9px; font-weight: 700; padding: 1px 6px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--cyan) 12%, transparent);
  color: var(--cyan);
  border: 1px solid color-mix(in srgb, var(--cyan) 28%, transparent);
}

.path-row { display: flex; gap: 6px; }

.path-arrow { flex-shrink: 0; color: var(--text-muted); opacity: 0.5; }

.btn-browse {
  display: flex; align-items: center; gap: 5px;
  height: 32px; padding: 0 11px; white-space: nowrap;
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius); color: var(--text-dim);
  font-size: 11px; cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-browse:hover:not(:disabled) { background: var(--surface2); color: var(--text); border-color: var(--border3); }
.btn-browse:disabled { opacity: 0.4; cursor: not-allowed; }

/* Output */
.output-section {
  flex: 1; min-height: 120px;
  background: var(--bg3); border: 1px solid var(--border2);
  border-radius: var(--radius-lg); overflow: hidden;
  display: flex; flex-direction: column;
}
.output-header {
  display: flex; align-items: center; gap: 7px;
  padding: 0 12px; height: 32px;
  background: var(--bg4); border-bottom: 1px solid var(--border);
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-muted);
  flex-shrink: 0;
}
.exit-badge {
  font-size: 9px; font-weight: 700; padding: 1px 7px;
  border-radius: var(--radius-pill);
}
.exit-ok { background: rgba(52,211,153,0.12); color: var(--green); border: 1px solid rgba(52,211,153,0.28); }
.exit-err { background: rgba(248,113,113,0.12); color: var(--red); border: 1px solid rgba(248,113,113,0.28); }
.btn-clear {
  margin-left: auto; background: none; border: none;
  color: var(--text-muted); font-size: 10px; cursor: pointer;
  padding: 2px 6px; border-radius: 4px;
  transition: color var(--transition-fast), background var(--transition-fast);
}
.btn-clear:hover:not(:disabled) { color: var(--text-dim); background: var(--surface); }

.output-log {
  flex: 1; min-height: 100px; max-height: 220px;
  overflow-y: auto; padding: 10px 14px;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 11.5px; line-height: 1.6; color: #c8c8e8;
  background: #060612;
  white-space: pre-wrap; word-break: break-all;
}
.output-placeholder { color: rgba(120,120,160,0.35); font-style: italic; }

/* Spinner */
.spinner {
  width: 12px; height: 12px;
  border: 1.5px solid var(--border2); border-top-color: var(--accent);
  border-radius: 50%; animation: spin 0.6s linear infinite; margin-left: auto;
}
.spinner-sm {
  width: 10px; height: 10px;
  border: 1.5px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Footer */
.modal-footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  padding: 12px 16px; border-top: 1px solid var(--border);
  background: var(--bg3); flex-shrink: 0;
}
.btn-cancel {
  background: var(--surface); color: var(--text-dim);
  border: 1px solid var(--border2); border-radius: var(--radius-pill);
  font-size: 12px; padding: 7px 16px; cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.btn-cancel:hover { background: var(--surface2); border-color: var(--border3); }

.btn-cancel-transfer {
  display: flex; align-items: center; gap: 6px;
  background: rgba(248,113,113,0.12); color: var(--red);
  border: 1px solid rgba(248,113,113,0.28); border-radius: var(--radius-pill);
  font-size: 12px; font-weight: 500; padding: 7px 16px; cursor: pointer;
  transition: background var(--transition-fast);
}
.btn-cancel-transfer:hover { background: rgba(248,113,113,0.2); }

.btn-transfer {
  display: flex; align-items: center; gap: 6px;
  background: var(--grad-btn); color: #fff; border: none;
  border-radius: var(--radius-pill); font-size: 12px; font-weight: 600;
  padding: 7px 18px; cursor: pointer;
  transition: opacity var(--transition);
}
.btn-transfer:hover:not(:disabled) { opacity: 0.82; }
.btn-transfer:disabled { opacity: 0.35; cursor: not-allowed; }

/* rsync section */
.rsync-section { display: flex; flex-direction: column; gap: 8px; }

.presets { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.preset-btn {
  padding: 4px 11px;
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: var(--radius-pill); color: var(--text-muted);
  font-size: 11px; font-weight: 500; cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.preset-btn:hover:not(:disabled) { background: var(--surface2); color: var(--text-dim); border-color: var(--border3); }
.preset-btn.active {
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: var(--accent-l);
  border-color: color-mix(in srgb, var(--accent) 38%, transparent);
}
.preset-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.field-hint {
  font-size: 10.5px; color: var(--text-muted); line-height: 1.5;
}
.field-hint code {
  font-family: 'SF Mono', monospace; color: var(--cyan);
  background: rgba(78,205,196,0.08); padding: 0 3px; border-radius: 3px;
}
.field-hint em { font-style: normal; color: var(--text-dim); }

/* Transitions */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.modal-enter-active { transition: opacity 0.2s, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.modal-leave-active { transition: opacity 0.15s, transform 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }
</style>
