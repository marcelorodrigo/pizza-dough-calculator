<script setup lang="ts">
import AppHeader from '../components/app/AppHeader.vue'
import OfflineStatus from '../components/app/OfflineStatus.vue'
import PwaUpdatePrompt from '../components/app/PwaUpdatePrompt.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <OfflineStatus />
    <PwaUpdatePrompt />
    <main id="main-content" class="page-shell">
      <slot />
    </main>
    <footer class="site-footer">
      <span>Good dough takes time.</span>
      <span>Keep your hands floured.</span>
    </footer>
  </div>
</template>
