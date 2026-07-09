<template>
  <div class="host-list">

    <div class="sidebar-header">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" stroke-width="1.3"/>
          <path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>
        <input
          v-model="search"
          class="search-input"
          placeholder="Search hosts…"
          autocomplete="off"
          spellcheck="false"
        />
        <button v-if="search" class="search-clear" @click="search = ''">
          <svg viewBox="0 0 10 10" width="8" height="8" fill="none">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <button class="btn-add" title="Add new connection" @click="openAddModal()">
        <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="list-scroll">

      <template v-if="search">
        <div v-if="searchResults.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
            <circle cx="11" cy="11" r="7.5" stroke="currentColor" stroke-width="1.3"/>
            <path d="M16.5 16.5L20 20" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M8 11h6M11 8v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
          </svg>
          <span>No results for <em>"{{ search }}"</em></span>
        </div>
        <template v-else>
          <div class="section-label">{{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}</div>
          <HostRow v-for="h in searchResults" :key="h.host" :host="h"
            @connect="$emit('connect', $event)" @config="$emit('config', $event)" @transfer="$emit('transfer', $event)" />
        </template>
      </template>

      <template v-else>
        <div v-for="[cat, items] in grouped" :key="cat" class="group">
          <button class="cat-row" @click="toggleCat(cat)">
            <svg
              class="cat-arrow"
              :class="{ open: !collapsed.has(cat) }"
              viewBox="0 0 6 10" width="6" height="10" fill="none"
            >
              <path d="M1 1l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="cat-name">{{ cat }}</span>
            <span class="cat-count">{{ items.length }}</span>
          </button>
          <div v-show="!collapsed.has(cat)" class="cat-items">
            <HostRow v-for="h in items" :key="h.host" :host="h"
              @connect="$emit('connect', $event)" @config="$emit('config', $event)" @transfer="$emit('transfer', $event)" />
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHosts } from '../composables/useHosts.js'
import { useModals } from '../composables/useModals.js'
import HostRow from './HostRow.vue'

const emit = defineEmits(['connect', 'config', 'transfer'])
const { openAddModal } = useModals()

const { hosts, grouped } = useHosts()
const search = ref('')
const collapsed = ref(new Set())

const searchResults = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return []
  return hosts.value.filter(h =>
    h.host.toLowerCase().includes(q) ||
    (h.hostname || '').toLowerCase().includes(q)
  )
})

function toggleCat(cat) {
  const s = new Set(collapsed.value)
  s.has(cat) ? s.delete(cat) : s.add(cat)
  collapsed.value = s
}
</script>

<style scoped>
.host-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-header {
  height: 48px;
  padding: 0 10px 0 12px;
  flex-shrink: 0;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-12);
  border: 1px solid var(--accent-28);
  border-radius: var(--radius);
  color: var(--accent-l);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
}
.btn-add:hover {
  background: var(--accent-20);
  box-shadow: 0 0 12px var(--accent-28);
  color: #fff;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 13px;
  height: 13px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 32px;
  background: var(--bg4);
  border: 1px solid var(--border2);
  border-radius: var(--radius-pill);
  color: var(--text);
  font-size: 12px;
  padding: 0 30px 0 32px;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}
.search-input::placeholder {
  color: var(--text-muted);
}
.search-input:focus {
  border-color: var(--accent-55);
  background: color-mix(in srgb, var(--accent) 6%, var(--bg4));
  box-shadow: 0 0 0 3px var(--accent-12);
}

.search-clear {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--surface2);
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 3px;
  line-height: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast), background var(--transition-fast);
}
.search-clear:hover {
  color: var(--text);
  background: var(--surface3);
}

.list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0 24px;
}

.section-label {
  padding: 8px 14px 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-muted);
}

.group {
  margin-top: 4px;
}

.cat-row {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 5px 14px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: left;
  transition: color var(--transition-fast);
}
.cat-row:hover {
  color: var(--text-dim);
}

.cat-arrow {
  flex-shrink: 0;
  color: inherit;
  transform: rotate(0deg);
  transition: transform 0.18s ease;
  opacity: 0.45;
}
.cat-arrow.open {
  transform: rotate(90deg);
}

.cat-name { flex: 1; }

.cat-count {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--overlay-strong);
  padding: 0 6px;
  height: 15px;
  line-height: 15px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  letter-spacing: 0;
}

.cat-items {
  padding-top: 2px;
  padding-bottom: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 52px 20px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}
.empty-state svg { opacity: 0.3; }
.empty-state em {
  color: var(--text-dim);
  font-style: normal;
}
</style>
