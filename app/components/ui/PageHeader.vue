<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    description: string
    badge: string
    headingId?: string
  }>(),
  {
    headingId: 'page-title'
  }
)
</script>

<template>
  <section
    class="mb-[30px] flex items-end justify-between gap-[24px] below-720:mb-[22px] below-720:block"
    :aria-labelledby="headingId"
  >
    <div>
      <p class="eyebrow m-0 mb-[9px] font-mono text-[10px] uppercase tracking-[0.13em] text-clay-eyebrow">{{ eyebrow }}</p>
      <h1 :id="headingId" class="m-0 font-serif text-[clamp(34px,5vw,56px)] font-semibold leading-[1.08] tracking-[-.045em] below-720:text-[clamp(35px,10vw,47px)]"><slot name="title">{{ title }}</slot></h1>
      <p class="mb-0 mt-[12px] max-w-[420px] text-[14px] leading-[1.65] text-muted below-720:text-[13px]">{{ description }}</p>
    </div>
    <span class="inline-flex items-center gap-[8px] whitespace-nowrap rounded-full border border-line bg-surface-subtle px-[13px] py-[10px] font-mono text-[10px] uppercase tracking-[0.05em] text-ink-soft below-720:mt-[15px]"><span class="h-[6px] w-[6px] rounded-full bg-olive-bright" />{{ badge }}</span>
  </section>
</template>
