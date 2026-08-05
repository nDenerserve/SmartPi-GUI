import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Default Pinia example store from the "create-vue" scaffold template.
// Not used anywhere in the SmartPi app; kept only as a reference for the
// Composition API store style (compare with the Options API style used
// in stores/auth.ts).
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
