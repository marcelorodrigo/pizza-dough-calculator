<script setup lang="ts">
const links = [
  { title: 'Recipe calculator', detail: 'Build your dough', to: '/', number: '01' },
  { title: 'Flour strength', detail: 'Blend by W value', to: '/tools/flour-strength', number: '02' },
  { title: 'Tin dough mass', detail: 'Size your pan', to: '/tools/tin-mass', number: '03' },
  { title: 'Water temperature', detail: 'Dial in your mix', to: '/tools/water-temperature', number: '04' }
]
</script>

<template>
  <nav class="mt-[27px] grid grid-cols-4 gap-[10px] below-960:grid-cols-2 below-720:gap-[7px] below-420:grid-cols-1" aria-label="Calculator tools">
    <NuxtLink
      v-for="item in links"
      :key="item.to"
      :to="item.to"
      class="tool-nav__item flex min-w-0 items-center gap-[11px] rounded-[10px] border border-line bg-surface-subtle p-[13px] no-underline transition-[transform,border-color] duration-[.15s] hover:-translate-y-[2px] hover:border-clay-border below-720:gap-[8px] below-720:p-[10px_9px] below-420:p-[11px_13px]"
    >
      <span class="tool-nav__number font-mono text-[10px] text-clay-dark">{{ item.number }}</span>
      <span class="grid min-w-0 gap-[3px]"><strong class="overflow-hidden text-[11px] font-bold text-ellipsis whitespace-nowrap text-ink-soft below-720:text-[10px]">{{ item.title }}</strong><small class="text-[10px] text-muted">{{ item.detail }}</small></span>
      <span class="ml-auto text-[13px] text-muted-soft" aria-hidden="true">↗</span>
    </NuxtLink>
  </nav>
</template>
