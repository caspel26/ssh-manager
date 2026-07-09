import { ref } from 'vue'

// Curated palette for host avatars — distinct from the accent-color presets
// so a user's chosen app accent never collides with their host-organization colors.
export const HOST_COLOR_PRESETS = [
  '#f87171', '#fb923c', '#fbbf24', '#a3e635',
  '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa',
  '#818cf8', '#a78bfa', '#e879a0', '#f472b6',
]

const hostPrefs = ref({})   // { [hostName]: { color, icon, connectCommand, ... } }
const loaded = ref(false)

export function useHostPrefs() {
  async function load() {
    if (loaded.value) return
    try {
      const prefs = await window.electronAPI.getPrefs()
      hostPrefs.value = prefs?.hosts ?? {}
    } catch { /* first launch or no IPC */ }
    loaded.value = true
  }

  function prefFor(host) {
    return hostPrefs.value[host] ?? {}
  }

  async function setHostAppearance(host, patch) {
    hostPrefs.value = { ...hostPrefs.value, [host]: { ...prefFor(host), ...patch } }
    try { await window.electronAPI.saveHostPref(host, patch) } catch { /* ignore */ }
  }

  function resetHostAppearance(host) {
    return setHostAppearance(host, { color: null, icon: null })
  }

  return { hostPrefs, load, prefFor, setHostAppearance, resetHostAppearance }
}
