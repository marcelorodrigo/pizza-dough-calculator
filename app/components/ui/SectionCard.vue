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
  <section
    :class="[variant === 'tool' ? 'tool-card' : 'form-card', 'rounded-[15px] border border-line bg-paper p-[22px] shadow-[0_8px_24px_rgba(64,46,26,0.035)] below-720:p-[18px]']"
    :aria-labelledby="headingId"
  >
    <div class="mb-[17px] flex items-start justify-between gap-[12px]">
      <div>
        <p class="eyebrow m-0 mb-[5px] font-mono text-[10px] uppercase tracking-[0.13em] text-clay">{{ eyebrow }}</p>
        <h2 :id="headingId" class="m-0 font-serif text-[23px] font-semibold tracking-[-.025em]">{{ title }}</h2>
      </div>
      <span v-if="step" class="step-mark grid h-[32px] w-[32px] place-items-center rounded-full border border-line font-mono text-[10px] text-[#a99c8d]">{{ step }}</span>
    </div>
    <p v-if="copy" class="section-copy -mt-[6px] mb-[18px] text-[13px] leading-[1.55] text-muted">{{ copy }}</p>
    <slot />
  </section>
</template>
