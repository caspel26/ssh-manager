<template>
  <Teleport to="body">
    <Transition name="pop">
      <div v-if="modelValue" class="pop-scrim" @mousedown="close">
        <div
          class="pop"
          :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
          @mousedown.stop
        >
          <div class="pop-section-label">Color</div>
          <div class="swatch-grid">
            <button
              class="swatch swatch--auto"
              :class="{ active: !color }"
              title="Auto (from host name)"
              @click="pick(null)"
            >
              <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
                <path d="M2 7a5 5 0 019-3M12 7a5 5 0 01-9 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                <path d="M11 2.5v2h-2M3 11.5v-2h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              v-for="c in HOST_COLOR_PRESETS" :key="c"
              class="swatch" :class="{ active: color === c }"
              :style="{ '--sw': c }"
              @click="pick(c)"
            ></button>
          </div>

          <div class="pop-section-label">Icon</div>
          <div class="icon-row">
            <input
              class="icon-input"
              :value="iconDraft"
              placeholder="e.g. 🔥 or PR"
              maxlength="4"
              @input="onIconInput"
            />
            <button v-if="icon" class="icon-clear" title="Clear icon" @click="clearIcon">
              <svg viewBox="0 0 10 10" width="8" height="8" fill="none">
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { HOST_COLOR_PRESETS } from '../composables/useHostPrefs.js'

const props = defineProps({
  modelValue: Boolean,
  anchor: Object,       // DOMRect-like { left, top, bottom, width }
  color: String,
  icon: String,
})
const emit = defineEmits(['update:modelValue', 'set-color', 'set-icon'])

const pos = ref({ x: 0, y: 0 })
const iconDraft = ref('')

watch(() => props.modelValue, open => {
  if (!open) return
  iconDraft.value = props.icon ?? ''
  if (props.anchor) {
    pos.value = {
      x: Math.min(props.anchor.left, window.innerWidth - 240),
      y: props.anchor.bottom + 8,
    }
  }
})

function close() { emit('update:modelValue', false) }
function pick(c) { emit('set-color', c) }

function onIconInput(e) {
  const chars = [...e.target.value].slice(0, 2).join('')
  iconDraft.value = chars
  emit('set-icon', chars || null)
}
function clearIcon() {
  iconDraft.value = ''
  emit('set-icon', null)
}
</script>

<style scoped>
.pop-scrim {
  position: fixed;
  inset: 0;
  z-index: 500;
}

.pop {
  position: fixed;
  width: 220px;
  background: var(--bg3);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pop-section-label {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.swatch-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--sw);
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.12s ease;
}
.swatch:hover { transform: scale(1.14); }
.swatch.active {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--sw);
}

.swatch--auto {
  background: var(--surface2);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.swatch--auto.active { border-color: var(--text); color: var(--text); }

.icon-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-input {
  flex: 1;
  height: 30px;
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 12px;
  padding: 0 10px;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.icon-input:focus {
  border-color: var(--accent-55);
  box-shadow: 0 0 0 3px var(--accent-08);
}
.icon-input::placeholder { color: var(--text-muted); }

.icon-clear {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.icon-clear:hover { background: rgba(248,113,113,0.12); color: var(--red); }

.pop-enter-active, .pop-leave-active { transition: opacity 0.12s ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; }
.pop-enter-active .pop, .pop-leave-active .pop {
  transition: opacity 0.12s ease, transform 0.16s cubic-bezier(0.22, 1, 0.36, 1);
}
.pop-enter-from .pop, .pop-leave-to .pop { opacity: 0; transform: translateY(-4px) scale(0.97); }
</style>
