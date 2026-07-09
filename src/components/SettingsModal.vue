<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="overlay" @click.self="close">
        <Transition name="modal">
          <div v-if="modelValue" class="modal" role="dialog" aria-modal="true">

            <div class="modal-header">
              <span class="modal-title">Settings</span>
              <button class="btn-close" @click="close">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div class="modal-body">

              <!-- Sidebar -->
              <nav class="sidebar">
                <button
                  v-for="tab in tabs" :key="tab.id"
                  class="nav-item" :class="{ active: activeTab === tab.id }"
                  @click="activeTab = tab.id"
                >
                  <svg v-html="tab.icon" viewBox="0 0 16 16" width="14" height="14" fill="none"></svg>
                  {{ tab.label }}
                </button>
              </nav>

              <!-- Content -->
              <div class="content">

                <!-- ── General ─────────────────────────── -->
                <template v-if="activeTab === 'general'">
                  <div class="section">
                    <div class="section-title">Connection</div>
                    <div class="field">
                      <label class="field-label" for="s-default-cmd">Default connect command</label>
                      <input id="s-default-cmd" v-model="draft.general.defaultConnectCommand" class="field-input" placeholder="ssh -A {host}" spellcheck="false"/>
                      <span class="field-hint"><code>{host}</code> is replaced with the host alias. Applied when a host has no custom command.</span>
                    </div>
                    <div class="field">
                      <label class="field-label" for="s-shell">Shell</label>
                      <input id="s-shell" v-model="draft.general.shell" class="field-input" placeholder="/bin/zsh  (leave empty for system default)" spellcheck="false"/>
                      <span class="field-hint">Path to the shell used to open the local terminal.</span>
                    </div>
                  </div>
                </template>

                <!-- ── Appearance ──────────────────────── -->
                <template v-if="activeTab === 'appearance'">
                  <div class="section">
                    <div class="section-title">Accent color</div>
                    <div class="color-presets">
                      <button
                        v-for="p in ACCENT_PRESETS" :key="p.value"
                        class="color-swatch"
                        :class="{ active: draft.appearance.accentColor === p.value }"
                        :style="{ '--swatch': p.value }"
                        :title="p.label"
                        @click="draft.appearance.accentColor = p.value"
                      ></button>
                    </div>
                  </div>
                </template>

                <!-- ── Terminal ────────────────────────── -->
                <template v-if="activeTab === 'terminal'">
                  <div class="section">
                    <div class="section-title">Color theme</div>
                    <div class="theme-grid">
                      <button
                        v-for="(theme, key) in TERMINAL_THEMES" :key="key"
                        class="theme-card" :class="{ active: draft.appearance.terminalTheme === key }"
                        :style="{ '--tbg': theme.colors.background }"
                        @click="draft.appearance.terminalTheme = key"
                      >
                        <div class="theme-preview">
                          <span
                            v-for="c in previewColors(theme)" :key="c"
                            class="theme-dot" :style="{ background: c }"
                          ></span>
                        </div>
                        <span class="theme-label">{{ theme.label }}</span>
                        <svg v-if="draft.appearance.terminalTheme === key" class="theme-check" viewBox="0 0 10 10" width="10" height="10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="section">
                    <div class="section-title">Font</div>
                    <div class="field">
                      <label class="field-label">Family</label>
                      <div class="pill-group">
                        <button
                          v-for="f in FONT_FAMILIES" :key="f.value"
                          class="pill" :class="{ active: draft.appearance.terminalFontFamily === f.value }"
                          @click="draft.appearance.terminalFontFamily = f.value"
                          :style="{ fontFamily: f.value }"
                        >{{ f.label }}</button>
                      </div>
                    </div>
                    <div class="field">
                      <label class="field-label" for="s-font-size">Size</label>
                      <div class="size-row">
                        <input id="s-font-size" v-model.number="draft.appearance.terminalFontSize" type="range" min="10" max="20" step="1" class="slider"/>
                        <span class="size-val">{{ draft.appearance.terminalFontSize }}px</span>
                      </div>
                    </div>
                    <div class="field">
                      <label class="field-label" for="s-line-height">Line height</label>
                      <div class="size-row">
                        <input id="s-line-height" v-model.number="draft.appearance.terminalLineHeight" type="range" min="1.0" max="2.0" step="0.05" class="slider"/>
                        <span class="size-val">{{ draft.appearance.terminalLineHeight.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="section">
                    <div class="section-title">Cursor</div>
                    <div class="field">
                      <label class="field-label">Style</label>
                      <div class="pill-group">
                        <button
                          v-for="s in cursorStyles" :key="s.value"
                          class="pill" :class="{ active: draft.appearance.cursorStyle === s.value }"
                          @click="draft.appearance.cursorStyle = s.value"
                        >{{ s.label }}</button>
                      </div>
                    </div>
                    <div class="field field--row">
                      <label class="field-label" for="s-cursor-blink">Blink</label>
                      <button
                        id="s-cursor-blink"
                        class="toggle" :class="{ on: draft.appearance.cursorBlink }"
                        @click="draft.appearance.cursorBlink = !draft.appearance.cursorBlink"
                        :aria-checked="draft.appearance.cursorBlink" role="switch"
                      ><span class="toggle-thumb"></span></button>
                    </div>
                  </div>

                  <div class="section">
                    <div class="section-title">Behaviour</div>
                    <div class="field">
                      <label class="field-label" for="s-scrollback">Scrollback lines</label>
                      <div class="size-row">
                        <input id="s-scrollback" v-model.number="draft.appearance.terminalScrollback" type="range" min="1000" max="50000" step="1000" class="slider"/>
                        <span class="size-val">{{ (draft.appearance.terminalScrollback / 1000).toFixed(0) }}k</span>
                      </div>
                    </div>
                    <div class="field field--row">
                      <label class="field-label">Bell</label>
                      <div class="pill-group pill-group--sm">
                        <button class="pill pill--xs" :class="{ active: draft.appearance.bell === 'none' }" @click="draft.appearance.bell = 'none'">Off</button>
                        <button class="pill pill--xs" :class="{ active: draft.appearance.bell === 'visual' }" @click="draft.appearance.bell = 'visual'">Visual</button>
                        <button class="pill pill--xs" :class="{ active: draft.appearance.bell === 'sound' }" @click="draft.appearance.bell = 'sound'">Sound</button>
                      </div>
                    </div>
                  </div>
                </template>

              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancel" @click="close">Cancel</button>
              <button class="btn-save" @click="saveAndClose">Save &amp; Close</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSettings, ACCENT_PRESETS, FONT_FAMILIES, TERMINAL_THEMES, DEFAULTS } from '../composables/useSettings.js'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const { settings, save } = useSettings()

const cursorStyles = [
  { label: 'Bar',       value: 'bar' },
  { label: 'Block',     value: 'block' },
  { label: 'Underline', value: 'underline' },
]

const tabs = [
  {
    id: 'general', label: 'General',
    icon: '<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M5 8h6M5 5.5h4M5 10.5h3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>',
  },
  {
    id: 'appearance', label: 'Appearance',
    icon: '<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 4v4l3 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    id: 'terminal', label: 'Terminal',
    icon: '<rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 7l2 2-2 2M9 11h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
]

const activeTab = ref('general')
const draft = ref(null)

watch(() => props.modelValue, open => {
  if (open) {
    activeTab.value = 'general'
    draft.value = JSON.parse(JSON.stringify(settings.value))
  }
})

function previewColors(theme) {
  const c = theme.colors
  return [c.red, c.green, c.yellow, c.blue, c.magenta, c.cyan, c.white, c.brightBlack]
}

async function saveAndClose() {
  Object.assign(settings.value, draft.value)
  await save()
  emit('update:modelValue', false)
}

function close() { emit('update:modelValue', false) }
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal {
  width: 680px;
  max-width: 100%;
  max-height: 88vh;
  background: var(--bg2);
  border: 1px solid var(--border2);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ─────────────────────────────── */
.modal-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg3);
  flex-shrink: 0;
}

.modal-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.btn-close {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-close:hover {
  background: rgba(248,113,113,0.12);
  color: var(--red);
  border-color: rgba(248,113,113,0.3);
}

/* ── Body ───────────────────────────────── */
.modal-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar {
  width: 148px;
  flex-shrink: 0;
  background: var(--bg3);
  border-right: 1px solid var(--border);
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  background: none;
  border: none;
  border-radius: var(--radius);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text-dim); }
.nav-item.active {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent-l);
}
.nav-item svg { flex-shrink: 0; opacity: 0.8; }

.content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Sections ───────────────────────────── */
.section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-muted);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}

/* ── Fields ─────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field--row {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}
.field--row .field-label { flex: 1; }

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-dim);
}

.field-input {
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
.field-input::placeholder { color: var(--text-muted); }
.field-input:focus {
  border-color: rgba(124,106,247,0.55);
  background: color-mix(in srgb, var(--accent) 5%, var(--bg4));
  box-shadow: 0 0 0 3px rgba(124,106,247,0.1);
}

.field-hint {
  font-size: 10.5px;
  color: var(--text-muted);
  line-height: 1.5;
}
.field-hint code {
  font-family: 'SF Mono', monospace;
  color: var(--cyan);
  background: rgba(78,205,196,0.08);
  padding: 0 3px;
  border-radius: 3px;
}

/* ── Color swatches ─────────────────────── */
.color-presets {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--swatch);
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  outline: none;
}
.color-swatch:hover { transform: scale(1.12); }
.color-swatch.active {
  border-color: #fff;
  box-shadow: 0 0 0 3px var(--swatch);
  transform: scale(1.08);
}

/* ── Pills ──────────────────────────────── */
.pill-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.pill {
  padding: 5px 12px;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.pill:hover { background: var(--surface2); color: var(--text-dim); }
.pill.active {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent-l);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}

/* ── Slider ─────────────────────────────── */
.size-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--border2);
  outline: none;
  cursor: pointer;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.4);
  transition: box-shadow 0.15s;
}
.slider::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 30%, transparent);
}

.size-val {
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  color: var(--text-dim);
  min-width: 36px;
  text-align: right;
}

/* ── Toggle ─────────────────────────────── */
.toggle {
  width: 36px; height: 20px;
  border-radius: 10px;
  background: var(--surface2);
  border: 1px solid var(--border2);
  cursor: pointer;
  position: relative;
  transition: background 0.2s, border-color 0.2s;
  flex-shrink: 0;
}
.toggle.on {
  background: var(--accent);
  border-color: var(--accent);
}
.toggle-thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.toggle.on .toggle-thumb { transform: translateX(16px); }

/* ── Footer ─────────────────────────────── */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg3);
  flex-shrink: 0;
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
.btn-cancel:hover { background: var(--surface2); border-color: var(--border3); }

.btn-save {
  background: var(--grad-btn);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 600;
  padding: 7px 18px;
  cursor: pointer;
  transition: opacity var(--transition);
}
.btn-save:hover { opacity: 0.82; }

/* ── Theme grid ─────────────────────────── */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.theme-card {
  position: relative;
  background: var(--tbg, #111);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  padding: 10px 8px 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 0.15s, transform 0.12s;
  outline: none;
}
.theme-card:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.2); }
.theme-card.active { border-color: var(--accent); }

.theme-preview {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.theme-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.theme-label {
  font-size: 9.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.65);
  letter-spacing: 0.02em;
  text-align: center;
}

.theme-check {
  position: absolute;
  top: 5px; right: 5px;
  color: var(--accent-l);
  background: color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 50%;
  padding: 1px;
}

.pill-group--sm { background: none; border: none; padding: 0; }
.pill--xs { padding: 4px 10px; font-size: 10.5px; }

/* ── Transitions ─────────────────────────── */
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.modal-enter-active { transition: opacity 0.2s, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.modal-leave-active { transition: opacity 0.15s, transform 0.15s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }
</style>
