import { ref } from 'vue'

const addModalOpen = ref(false)

export function useModals() {
  return {
    addModalOpen,
    openAddModal() { addModalOpen.value = true },
    closeAddModal() { addModalOpen.value = false },
  }
}
