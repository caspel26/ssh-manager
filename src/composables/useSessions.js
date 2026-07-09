import { ref } from 'vue'

let nextId = 1

export const sessions = ref([])   // [{ id, host, label, active }]
export const activeId = ref(null)

export function useSessions() {
  function openSession(host) {
    const existing = sessions.value.find(s => s.host === host)
    if (existing) { activeId.value = existing.id; return existing }

    const id = `pty-${nextId++}`
    const session = { id, host, label: host }
    sessions.value.push(session)
    activeId.value = id
    return session
  }

  function closeSession(id) {
    window.electronAPI.killPty(id)
    const idx = sessions.value.findIndex(s => s.id === id)
    if (idx !== -1) sessions.value.splice(idx, 1)
    if (activeId.value === id) {
      activeId.value = sessions.value[Math.max(0, idx - 1)]?.id ?? null
    }
  }

  function setActive(id) {
    activeId.value = id
  }

  return { sessions, activeId, openSession, closeSession, setActive }
}
