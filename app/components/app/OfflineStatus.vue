<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const isOnline = ref(true)

/** Syncs the banner with the browser's current connectivity state. */
function updateStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  updateStatus()
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<template>
  <p
    v-if="!isOnline"
    class="fixed bottom-[20px] left-1/2 z-10 m-0 flex w-max max-w-[calc(100%_-_32px)] -translate-x-1/2 items-center gap-[20px] rounded-[12px] border border-toast-border bg-toast-surface px-[16px] py-[13px] text-[13px] text-toast shadow-toast"
    role="status"
  >
    You’re offline. Your calculator and saved inputs are still available on this device.
  </p>
</template>
