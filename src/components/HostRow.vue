<template>
  <div class="host-row" @click="$emit('connect', host.host)">

    <div class="row-accent-bar"></div>

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
        <span v-if="proxyLabel" class="meta-proxy">{{ proxyLabel }}</span>
      </div>
    </div>

    <div class="row-actions">
      <button class="btn-cfg" title="View / edit SSH config" @click.stop="$emit('config', host.host)">
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
          <circle cx="7" cy="7" r="1.8" stroke="currentColor" stroke-width="1.3"/>
          <path d="M7 1.5V3M7 11v1.5M1.5 7H3M11 7h1.5M3.4 3.4l1.1 1.1M9.5 9.5l1.1 1.1M3.4 10.6l1.1-1.1M9.5 4.5l1.1-1.1"
            stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </button>
      <button class="btn-cfg" title="Transfer files (scp / rsync)" @click.stop="$emit('transfer', host.host)">
        <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
          <path d="M7 1.5v11M4 9.5l3 3 3-3M4 4.5l3-3 3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="btn-connect" @click.stop="$emit('connect', host.host)">
        Connect
        <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { roleTag } from '../composables/useHosts.js'

const props = defineProps({ host: Object })
defineEmits(['connect', 'config', 'transfer'])

const tag = computed(() => roleTag(props.host.host))
const port = computed(() => props.host.port && props.host.port !== '22' ? props.host.port : null)
const proxyLabel = computed(() => {
  const h = props.host
  if (h.proxyjump) return `via ${h.proxyjump}`
  if (h.proxycommand) return 'via proxy'
  return null
})
</script>

<style scoped>
.host-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 8px 14px;
  cursor: pointer;
  position: relative;
  transition: background var(--transition-fast);
}
.host-row:hover {
  background: color-mix(in srgb, var(--accent) 7%, var(--bg3));
}

.row-accent-bar {
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  border-radius: 2px;
  background: transparent;
  transition: background var(--transition), box-shadow var(--transition);
}
.host-row:hover .row-accent-bar {
  background: var(--accent);
}

.host-row:hover .row-actions {
  opacity: 1;
  pointer-events: all;
  transform: translateX(0);
}

.row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-top {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.row-name {
  font-size: 12px;
  font-family: 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  font-size: 10px;
  font-family: 'SF Mono', monospace;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.meta-host  { color: rgba(78,205,196,0.75); }
.meta-user  { color: var(--text-muted); }
.meta-port  { color: var(--text-muted); }
.meta-dot   { opacity: 0.28; }
.meta-proxy {
  color: rgba(251,146,60,0.75);
  font-size: 9px;
  font-style: italic;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(6px);
  transition: opacity var(--transition), transform var(--transition);
  flex-shrink: 0;
}

.btn-cfg {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius);
  color: var(--text-dim);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.btn-cfg:hover {
  background: color-mix(in srgb, var(--cyan) 12%, transparent);
  color: var(--cyan);
  border-color: rgba(78,205,196,0.35);
}

.btn-connect {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 13px;
  background: var(--grad-btn);
  border: none;
  border-radius: var(--radius-pill);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.01em;
  transition: opacity var(--transition);
}
.btn-connect:hover {
  opacity: 0.82;
}
</style>
