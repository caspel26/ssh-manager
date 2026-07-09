<template>
  <div class="host-row" @click="$emit('connect', host.host)">

    <div class="row-accent-bar"></div>

    <div ref="avatarEl" class="host-avatar" :style="avatarStyle" @click.stop="openPicker">
      {{ displayGlyph }}
      <span class="avatar-edit" title="Customize color &amp; icon">
        <svg viewBox="0 0 10 10" width="7" height="7" fill="none">
          <path d="M1 7.5V9h1.5l4.4-4.4L5.4 3.1 1 7.5zM8.4 2.6a.7.7 0 000-1L7.6.8a.7.7 0 00-1 0L5.9 1.5l1.8 1.8.7-.7z" fill="currentColor"/>
        </svg>
      </span>
    </div>

    <AvatarPicker
      v-model="pickerOpen"
      :anchor="anchorRect"
      :color="pref.color"
      :icon="pref.icon"
      @set-color="c => setHostAppearance(host.host, { color: c })"
      @set-icon="i => setHostAppearance(host.host, { icon: i })"
    />

    <div class="row-body">
      <div class="row-top">
        <span class="row-name">{{ host.host }}</span>
        <span v-if="tag" class="role-badge" :style="{ '--c': tag.color }">{{ tag.label }}</span>
      </div>
      <div class="row-meta">
        <span v-if="host.hostname" class="meta-host">{{ host.hostname }}</span>
        <template v-if="host.hostname && (host.user || port || proxyLabel)">
          <span class="meta-dot">·</span>
        </template>
        <span v-if="host.user" class="meta-user">{{ host.user }}</span>
        <span v-if="port" class="meta-port">:{{ port }}</span>
        <span v-if="proxyLabel" class="meta-proxy">via proxy</span>
      </div>
    </div>

    <div class="row-actions">
      <button class="btn-cfg" title="Edit SSH config" @click.stop="$emit('config', host.host)">
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
          <path d="M2 10.5V12h1.5l5-5L7 5.5l-5 5zM11.7 3.8a.996.996 0 000-1.41l-1.09-1.09a.996.996 0 00-1.41 0L8.15 2.35 10.65 4.85l1.05-1.05z" fill="currentColor" opacity=".85"/>
        </svg>
      </button>
      <button class="btn-cfg" title="Transfer files" @click.stop="$emit('transfer', host.host)">
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
          <path d="M7 1.5v11M4 9.5l3 3 3-3M4 4.5l3-3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="btn-connect" @click.stop="$emit('connect', host.host)">
        Connect
        <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { roleTag } from '../composables/useHosts.js'
import { useHostPrefs } from '../composables/useHostPrefs.js'
import AvatarPicker from './AvatarPicker.vue'

const props = defineProps({ host: Object })
defineEmits(['connect', 'config', 'transfer'])

const { prefFor, setHostAppearance } = useHostPrefs()
const pref = computed(() => prefFor(props.host.host))

const tag = computed(() => roleTag(props.host.host))
const port = computed(() => props.host.port && props.host.port !== '22' ? props.host.port : null)
const proxyLabel = computed(() => {
  const h = props.host
  return h.proxyjump || h.proxycommand || null
})

const initial = computed(() => (props.host.host?.[0] ?? '?').toUpperCase())
const displayGlyph = computed(() => pref.value.icon || initial.value)

function hashHue(str) {
  let h = 0
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  return Math.abs(h) % 360
}

// Extract just the hue from a #hex preset so custom colors render with the
// same three-tone treatment (bg/border/fg) as the auto hash-derived ones.
function hexToHue(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) / 255, g = ((n >> 8) & 0xff) / 255, b = (n & 0xff) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  if (d === 0) return 0
  let h
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h *= 60
  return h < 0 ? h + 360 : h
}

const avatarStyle = computed(() => {
  const hue = pref.value.color ? hexToHue(pref.value.color) : hashHue(props.host.host)
  return {
    '--av-color': `hsl(${hue},55%,58%)`,
    background: `hsl(${hue},50%,18%)`,
    borderColor: `hsl(${hue},45%,30%)`,
    color: `hsl(${hue},55%,58%)`,
  }
})

// ── Color/icon picker popover ───────────────────────────────────────
const avatarEl = ref(null)
const pickerOpen = ref(false)
const anchorRect = ref(null)

function openPicker() {
  anchorRect.value = avatarEl.value.getBoundingClientRect()
  pickerOpen.value = true
}
</script>

<style scoped>
.host-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: var(--row-pad-y, 7px) 10px var(--row-pad-y, 7px) 12px;
  cursor: pointer;
  position: relative;
  transition: background var(--transition-fast);
  border-radius: 6px;
  margin: 0 6px;
}
.host-row:hover {
  background: var(--hover);
}

.row-accent-bar {
  position: absolute;
  left: -6px;
  top: 8px;
  bottom: 8px;
  width: 2.5px;
  border-radius: 0 2px 2px 0;
  background: transparent;
  transition: background var(--transition), box-shadow var(--transition);
}
.host-row:hover .row-accent-bar {
  background: var(--av-color, var(--accent));
  box-shadow: 0 0 8px var(--av-color, var(--accent));
}

.host-row:hover .row-actions {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0);
}

.host-avatar {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  font-family: -apple-system, system-ui, sans-serif;
  letter-spacing: 0;
  position: relative;
  transition: filter var(--transition-fast);
}
.host-row:hover .host-avatar {
  filter: brightness(1.15);
}

.avatar-edit {
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 13px;
  height: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 4px;
  color: var(--text-dim);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity var(--transition-fast), transform var(--transition-fast), background var(--transition-fast);
}
.host-row:hover .avatar-edit {
  opacity: 1;
  transform: scale(1);
}
.avatar-edit:hover {
  background: var(--accent-20);
  color: var(--accent-l);
}

.row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-top {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.row-name {
  font-size: 12.5px;
  font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.role-badge {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--c) 14%, transparent);
  color: var(--c);
  border: 1px solid color-mix(in srgb, var(--c) 30%, transparent);
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-family: 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.meta-host  { color: rgba(78,205,196,0.8); }
.meta-user  { color: var(--text-muted); }
.meta-port  { color: var(--text-muted); }
.meta-dot   { opacity: 0.25; }
.meta-proxy {
  color: rgba(251,146,60,0.7);
  font-size: 9.5px;
  font-style: italic;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(4px);
  transition: opacity var(--transition), transform var(--transition);
  flex-shrink: 0;
}

.btn-cfg {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-strong);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-cfg:hover {
  background: rgba(78,205,196,0.1);
  color: var(--cyan);
  border-color: rgba(78,205,196,0.3);
}

.btn-connect {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 12px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-d) 100%);
  border: none;
  border-radius: var(--radius-pill);
  color: var(--accent-contrast);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  box-shadow: 0 2px 10px var(--accent-35);
  transition: box-shadow var(--transition-fast), filter var(--transition-fast);
}
.btn-connect:hover {
  filter: brightness(1.12);
  box-shadow: 0 3px 16px var(--accent-55);
}
</style>
