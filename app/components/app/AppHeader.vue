<script setup lang="ts">
import { useThemePreference } from '../../composables/useThemePreference'

const links = [
  { label: 'Recipe', to: '/' },
  { label: 'Flour strength', to: '/tools/flour-strength' },
  { label: 'Tin mass', to: '/tools/tin-mass' },
  { label: 'Water temp', to: '/tools/water-temperature' }
]

const { preference, setPreference } = useThemePreference()
</script>

<template>
  <header class="sticky top-0 z-[5] border-b border-line bg-header-surface backdrop-blur-[14px] below-720:static">
    <div
      class="mx-auto flex min-h-[74px] w-[min(1240px,calc(100%_-_48px))] items-center gap-[48px] below-960:flex-wrap below-960:justify-between below-960:gap-[10px] below-960:pt-[12px] below-720:min-h-[65px] below-720:w-[calc(100%_-_30px)]"
    >
      <NuxtLink class="brand inline-flex flex-[0_0_auto] items-center gap-[10px] no-underline" to="/" aria-label="Dough Notes home">
        <span
          class="grid h-[35px] w-[35px] place-items-center rounded-full bg-clay font-serif text-[21px] font-bold text-on-clay below-720:h-[31px] below-720:w-[31px] below-720:text-[19px]"
          aria-hidden="true"
        >D</span>
        <span class="text-[18px] font-bold tracking-[-.05em] below-720:text-[16px]">Dough<span class="text-clay-dark">Notes</span></span>
      </NuxtLink>
      <nav
        class="flex items-center gap-[5px] below-960:order-2 below-960:-mx-[15px] below-960:w-[calc(100%_+_30px)] below-960:gap-0 below-960:overflow-x-auto below-960:border-t below-960:border-line-subtle below-960:px-[8px]"
        aria-label="Calculators"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="primary-nav__link rounded-[8px] px-[13px] py-[10px] text-[13px] font-semibold text-ink-soft no-underline transition-[background-color,color] duration-[.18s] hover:bg-clay-soft hover:text-clay-dark [&.router-link-active]:bg-clay-soft [&.router-link-active]:text-clay-dark below-720:flex-[0_0_auto] below-720:px-[12px] below-720:py-[12px] below-720:text-[11px]"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="ml-auto flex items-center gap-[12px] below-960:gap-[8px]">
        <ThemePreferenceToggle
          :model-value="preference"
          @update:model-value="setPreference"
        />
        <span class="flex items-center gap-[8px] font-mono text-[10px] uppercase tracking-[0.04em] text-muted below-960:hidden"><span class="h-[7px] w-[7px] rounded-full bg-olive-bright shadow-status" />Made for the bake</span>
      </div>
    </div>
  </header>
</template>
