<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="overlay" @click.self="close">

        <Transition name="drawer">
          <div v-if="modelValue" class="drawer">

            <div class="drawer-header">
              <div class="drawer-title">
                <span class="drawer-icon">
                  <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="url(#dg)" stroke-width="1.3"/>
                    <path d="M4 7.5h8M4 9.5h5" stroke="url(#dg)" stroke-width="1.1" stroke-linecap="round"/>
                    <defs>
                      <linearGradient id="dg" x1="1" y1="3" x2="15" y2="13" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#7c6af7"/>
                        <stop offset="1" stop-color="#4ecdc4"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <div class="drawer-title-text">
                  <div class="drawer-hostname">{{ hostName }}</div>
                  <div class="drawer-filepath" v-if="fileInfo">{{ fileInfo.path }}</div>
                </div>
              </div>
              <div class="drawer-hdr-actions">
                <Transition name="fade">
                  <div v-if="dirty" class="dirty-actions">
                    <button class="btn-discard" @click="discard">Revert</button>
                    <button class="btn-save" @click="save" :disabled="saving">
                      <svg v-if="!saving" viewBox="0 0 12 12" width="10" height="10" fill="none">
                        <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ saving ? 'Saving…' : 'Save' }}
                    </button>
                  </div>
                </Transition>
                <button class="btn-close" @click="close" title="Close">
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="drawer-body">

              <div v-if="loading" class="state-msg">
                <div class="spinner"></div>
                Loading…
              </div>
              <div v-else-if="error" class="state-msg error">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {{ error }}
              </div>

              <template v-else>
                <!-- Mode tabs -->
                <div class="mode-tabs">
                  <button class="mode-tab" :class="{ active: mode === 'form' }" @click="mode = 'form'">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <rect x="1" y="2" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
                      <path d="M3.5 5h5M3.5 7.5h3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
                    </svg>
                    Form
                  </button>
                  <button class="mode-tab" :class="{ active: mode === 'raw' }" @click="mode = 'raw'">
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                      <path d="M1 3l3 3-3 3M6 9h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Raw
                  </button>
                </div>

                <!-- Form mode -->
                <template v-if="mode === 'form'">
                  <div class="form-fields">
                    <div class="form-row">
                      <div class="form-field form-field--grow">
                        <label class="form-label" for="d-hostname">HostName</label>
                        <input id="d-hostname" v-model="formData.hostname" class="form-input" placeholder="192.168.1.1 or domain.com" @input="applyForm" spellcheck="false"/>
                      </div>
                      <div class="form-field form-field--port">
                        <label class="form-label" for="d-port">Port</label>
                        <input id="d-port" v-model="formData.port" class="form-input" placeholder="22" type="number" min="1" max="65535" @input="applyForm"/>
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-field form-field--grow">
                        <label class="form-label" for="d-user">User</label>
                        <input id="d-user" v-model="formData.user" class="form-input" placeholder="username" @input="applyForm" spellcheck="false"/>
                      </div>
                      <div class="form-field form-field--grow">
                        <label class="form-label" for="d-identityfile">IdentityFile</label>
                        <input id="d-identityfile" v-model="formData.identityfile" class="form-input" placeholder="~/.ssh/id_rsa" @input="applyForm" spellcheck="false"/>
                      </div>
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="d-proxyjump">ProxyJump</label>
                      <input id="d-proxyjump" v-model="formData.proxyjump" class="form-input" placeholder="jump-host alias" @input="applyForm" spellcheck="false"/>
                    </div>
                    <div class="form-field">
                      <label class="form-label" for="d-extra">Extra options</label>
                      <textarea id="d-extra" v-model="formData.extra" class="form-textarea" placeholder="ServerAliveInterval 60&#10;Compression yes" rows="3" @input="applyForm" spellcheck="false"/>
                      <span class="form-hint">One <code>Key Value</code> per line — written after the fields above</span>
                    </div>
                  </div>
                </template>

                <!-- Raw mode -->
                <template v-else>
                  <section class="card card-editor">
                    <div class="card-label editor-label">
                      <div class="editor-label-left">
                        <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                          <path d="M1 3l3 3-3 3M6 9h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>ssh_config</span>
                        <span class="lang-badge">conf</span>
                      </div>
                      <span v-if="dirty" class="modified-badge">
                        <svg viewBox="0 0 8 8" width="6" height="6" fill="none">
                          <circle cx="4" cy="4" r="3" fill="currentColor" opacity="0.7"/>
                        </svg>
                        unsaved
                      </span>
                    </div>
                    <div class="editor-chrome">
                      <div class="editor-wrap">
                        <div ref="lineNumsEl" class="line-nums" aria-hidden="true">
                          <span v-for="n in lineCount" :key="n">{{ n }}</span>
                        </div>
                        <textarea
                          class="code-editor"
                          v-model="editorContent"
                          spellcheck="false"
                          autocomplete="off"
                          autocorrect="off"
                          @input="onRawInput"
                          @scroll="syncScroll"
                        ></textarea>
                      </div>
                      <div class="editor-footer">
                        <span class="footer-info">{{ lineCount }} lines</span>
                        <span class="footer-info">UTF-8</span>
                        <span class="footer-info">SSH Config</span>
                      </div>
                    </div>
                  </section>
                </template>

              <!-- Connect command — always visible -->
              <div class="connect-section">
                <div class="connect-section-label">
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                    <path d="M1 3l3 3-3 3M6 9h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Launch
                </div>
                <div class="form-field">
                  <label class="form-label" for="d-connect-cmd">Connect command</label>
                  <input
                    id="d-connect-cmd"
                    v-model="connectCmd"
                    class="form-input"
                    :placeholder="`ssh -A {host}`"
                    spellcheck="false"
                    autocomplete="off"
                    @change="saveConnectCmd"
                  />
                  <span class="form-hint"><code>{host}</code> is replaced with the host alias at connect time</span>
                </div>
              </div>

              </template>
            </div>

          </div>
        </Transition>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({ modelValue: Boolean, hostName: String })
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const error = ref(null)
const fileInfo = ref(null)
const editorContent = ref('')
const originalContent = ref('')
const dirty = ref(false)
const saving = ref(false)
const mode = ref('form')
const formData = ref(emptyForm())
const connectCmd = ref('')

watch(() => props.modelValue, open => { if (open) loadConfig() })

function emptyForm() {
  return { hostname: '', user: '', port: '', identityfile: '', proxyjump: '', extra: '' }
}

const TRACKED_KEYS = new Set(['hostname', 'user', 'port', 'identityfile', 'proxyjump'])

function hostNameRegex(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
  return new RegExp(String.raw`^Host\s+${escaped}\s*$`, 'i')
}

function findBlockBounds(lines, re) {
  let start = -1
  let end = lines.length
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if (start === -1) { if (re.test(t)) start = i }
    else if (/^Host\s/i.test(t)) { end = i; break }
  }
  return { start, end }
}

function parseForm(content, hostName) {
  const re = hostNameRegex(hostName)
  const lines = content.split('\n')
  const { start, end } = findBlockBounds(lines, re)
  const data = emptyForm()
  if (start === -1) return data
  const extraLines = []
  for (let i = start + 1; i < end; i++) {
    const line = lines[i].trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^(\w+)\s+(.+)$/)
    if (!m) continue
    const key = m[1].toLowerCase()
    if (TRACKED_KEYS.has(key)) data[key] = m[2]
    else extraLines.push(line)
  }
  data.extra = extraLines.join('\n')
  return data
}

function serializeBlock(hostName, f) {
  const lines = [`Host ${hostName}`]
  if (f.hostname.trim()) lines.push(`  HostName ${f.hostname.trim()}`)
  if (f.user.trim()) lines.push(`  User ${f.user.trim()}`)
  if (f.port) lines.push(`  Port ${f.port}`)
  if (f.identityfile.trim()) lines.push(`  IdentityFile ${f.identityfile.trim()}`)
  if (f.proxyjump.trim()) lines.push(`  ProxyJump ${f.proxyjump.trim()}`)
  for (const line of f.extra.split('\n')) {
    const t = line.trim()
    if (t) lines.push(`  ${t}`)
  }
  return lines.join('\n')
}

function replaceBlock(content, hostName, newBlock) {
  const re = hostNameRegex(hostName)
  const lines = content.split('\n')
  const { start, end } = findBlockBounds(lines, re)
  if (start === -1) return content
  lines.splice(start, end - start, ...newBlock.split('\n'))
  return lines.join('\n')
}

async function loadConfig() {
  loading.value = true; error.value = null; dirty.value = false; mode.value = 'form'
  try {
    const [r, pref] = await Promise.all([
      globalThis.electronAPI.getHostConfig(props.hostName),
      globalThis.electronAPI.getHostPref(props.hostName),
    ])
    if (!r) { error.value = 'Host not found in any config file.'; return }
    fileInfo.value = r
    editorContent.value = r.content
    originalContent.value = r.content
    formData.value = parseForm(r.content, props.hostName)
    connectCmd.value = pref.connectCommand ?? ''
  } catch (e) { error.value = e.message }
  finally { loading.value = false }
}

async function saveConnectCmd() {
  try {
    await globalThis.electronAPI.saveHostPref(props.hostName, { connectCommand: connectCmd.value.trim() || null })
  } catch { /* non-critical */ }
}

function applyForm() {
  const newBlock = serializeBlock(props.hostName, formData.value)
  editorContent.value = replaceBlock(editorContent.value, props.hostName, newBlock)
  dirty.value = true
}

function onRawInput() {
  dirty.value = true
  formData.value = parseForm(editorContent.value, props.hostName)
}

const lineCount = computed(() => editorContent.value.split('\n').length)

const lineNumsEl = ref(null)
function syncScroll(e) {
  if (lineNumsEl.value) lineNumsEl.value.scrollTop = e.target.scrollTop
}

function discard() {
  editorContent.value = originalContent.value
  formData.value = parseForm(originalContent.value, props.hostName)
  dirty.value = false
}

async function save() {
  saving.value = true
  try {
    await globalThis.electronAPI.saveHostConfig(fileInfo.value.path, editorContent.value)
    originalContent.value = editorContent.value; dirty.value = false
  } catch (e) { error.value = e.message }
  finally { saving.value = false }
}

function close() { emit('update:modelValue', false) }
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 560px;
  max-width: 92vw;
  height: 100%;
  background: var(--bg2);
  border-left: 1px solid var(--border2);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg), -8px 0 40px rgba(0,0,0,0.4);
  overflow: hidden;
  position: relative;
}


.drawer-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  gap: 10px;
  flex-shrink: 0;
  background: var(--bg3);
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.drawer-icon {
  width: 34px;
  height: 34px;
  background: var(--grad-subtle);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drawer-title-text { min-width: 0; }

.drawer-hostname {
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-filepath {
  font-size: 10px;
  color: var(--text-muted);
  font-family: 'SF Mono', monospace;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.drawer-hdr-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dirty-actions {
  display: flex;
  gap: 6px;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--grad-btn);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity var(--transition);
}
.btn-save:hover { opacity: 0.82; }
.btn-save:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-discard {
  background: var(--surface);
  color: var(--text-dim);
  border: 1px solid var(--border2);
  border-radius: var(--radius-pill);
  font-size: 12px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.btn-discard:hover {
  background: var(--surface2);
  border-color: var(--border3);
}

.btn-close {
  width: 30px;
  height: 30px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-close:hover {
  background: rgba(248,113,113,0.12);
  color: var(--red);
  border-color: rgba(248,113,113,0.3);
}

.drawer-body {
  flex: 1;
  min-height: 0;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.state-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 40px;
  color: var(--text-muted);
  font-size: 13px;
  justify-content: center;
}
.state-msg.error { color: var(--red); }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.card {
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.card-label {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-dim);
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
}

.field-count {
  margin-left: 4px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent-l);
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  letter-spacing: 0;
}

/* ── Mode tabs ────────────────────────── */
.mode-tabs {
  display: flex;
  gap: 2px;
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius-pill);
  padding: 3px;
  flex-shrink: 0;
  align-self: flex-start;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
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

/* ── Form fields ──────────────────────── */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  padding-bottom: 4px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-field--grow { flex: 1; min-width: 0; }
.form-field--port { width: 90px; flex-shrink: 0; }

.form-label {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.01em;
}

.form-input {
  height: 32px;
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 12px;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  padding: 0 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}
.form-input::placeholder { color: var(--text-muted); }
.form-input:focus {
  border-color: rgba(124,106,247,0.55);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg4));
  box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
}

.form-textarea {
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 12px;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  padding: 8px 10px;
  outline: none;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.6;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.form-textarea::placeholder { color: var(--text-muted); }
.form-textarea:focus {
  border-color: rgba(124,106,247,0.55);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg4));
  box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
}

.form-hint {
  font-size: 10px;
  color: var(--text-muted);
}
.form-hint code {
  font-family: 'SF Mono', monospace;
  color: var(--cyan);
  background: rgba(78,205,196,0.08);
  padding: 0 3px;
  border-radius: 3px;
}

/* ── Editor card ──────────────────────── */
.card-editor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.editor-label {
  padding: 0 14px;
  height: 36px;
  background: var(--bg4);
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}

.editor-label-left {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: 1;
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

.modified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(251,146,60,0.12);
  color: var(--orange);
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(251,146,60,0.25);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.editor-chrome {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.editor-wrap {
  display: flex;
  flex: 1;
  min-height: 0;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 12.5px;
  line-height: 1.7;
  overflow: hidden;
  background: #07070f;
  position: relative;
}

.line-nums {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 14px 10px 14px 8px;
  color: rgba(120,120,160,0.4);
  font-size: 11px;
  line-height: 1.7;
  user-select: none;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--bg);
  min-width: 44px;
  overflow: hidden;
}
.line-nums span { display: block; }

.code-editor {
  flex: 1;
  padding: 14px 18px;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  color: #d4d4f0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  caret-color: var(--accent);
  user-select: text;
  overflow: auto;
  white-space: pre;
}

.editor-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 14px;
  height: 24px;
  background: var(--bg4);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.footer-info {
  font-size: 10px;
  color: rgba(120,120,160,0.5);
  font-family: 'SF Mono', monospace;
  letter-spacing: 0.02em;
}

/* ── Connect section ──────────────────── */
.connect-section {
  border-top: 1px solid var(--border);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.connect-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-muted);
}

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.22s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.drawer-enter-active { transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
.drawer-leave-active { transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
