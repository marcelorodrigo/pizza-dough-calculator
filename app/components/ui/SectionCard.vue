<script setup lang="ts">
defineProps<{
  headingId: string
  eyebrow: string
  title: string
  step?: string
  variant?: 'form' | 'tool'
  copy?: string
}>()
</script>

<template>
  <section :class="variant === 'tool' ? 'tool-card' : 'form-card'" :aria-labelledby="headingId">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h2 :id="headingId">{{ title }}</h2>
      </div>
      <span v-if="step" class="step-mark">{{ step }}</span>
    </div>
    <p v-if="copy" class="section-copy">{{ copy }}</p>
    <slot />
  </section>
</template>
