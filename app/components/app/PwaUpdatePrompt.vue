<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const updateAvailable = ref(false)
let registration: ServiceWorkerRegistration | undefined
let installingWorker: ServiceWorker | null = null
let serviceWorkerContainer: ServiceWorkerContainer | undefined
let updateRequested = false
let isMounted = false

function watchInstallingWorker() {
  if (!installingWorker) return
  const worker = installingWorker
  const onStateChange = () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      updateAvailable.value = true
    }
    if (worker.state === 'installed' || worker.state === 'redundant') {
      worker.removeEventListener('statechange', onStateChange)
    }
  }
  worker.addEventListener('statechange', onStateChange)
}

function onUpdateFound() {
  installingWorker = registration?.installing ?? null
  watchInstallingWorker()
}

onMounted(async () => {
  isMounted = true
  if (!('serviceWorker' in navigator)) return
  serviceWorkerContainer = navigator.serviceWorker
  registration = await serviceWorkerContainer.getRegistration()
    ?? await serviceWorkerContainer.ready
  if (!isMounted) return
  if (!registration) return
  if (registration.waiting && navigator.serviceWorker.controller) updateAvailable.value = true
  registration.addEventListener('updatefound', onUpdateFound)
  serviceWorkerContainer.addEventListener('controllerchange', onControllerChange)
})

onUnmounted(() => {
  isMounted = false
  registration?.removeEventListener('updatefound', onUpdateFound)
  serviceWorkerContainer?.removeEventListener('controllerchange', onControllerChange)
})

function onControllerChange() {
  if (updateRequested) location.reload()
}

function applyUpdate() {
  const waitingWorker = registration?.waiting
  if (!waitingWorker) return
  updateRequested = true
  waitingWorker.postMessage({ type: 'SKIP_WAITING' })
}
</script>

<template>
  <aside
    v-if="updateAvailable"
    class="fixed bottom-[20px] left-1/2 z-10 m-0 flex w-max max-w-[calc(100%_-_32px)] -translate-x-1/2 items-center gap-[20px] rounded-[12px] border border-toast-border bg-toast-surface px-[16px] py-[13px] text-[13px] text-toast shadow-toast"
    role="status"
  >
    <span>A fresh batch is ready.</span>
    <button class="rounded-[6px] border-0 bg-clay px-[12px] py-[8px] font-bold text-on-clay" type="button" @click="applyUpdate">Update app</button>
  </aside>
</template>
