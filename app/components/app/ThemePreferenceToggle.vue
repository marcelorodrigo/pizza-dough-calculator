<script setup lang="ts">
import type { ThemePreference } from '../../domain/theme'

defineProps<{
  modelValue: ThemePreference
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ThemePreference]
}>()

const options = [
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' }
] as const satisfies ReadonlyArray<{ value: ThemePreference; label: string }>
</script>

<template>
  <div
    class="inline-flex items-center gap-[2px] rounded-full border border-line bg-surface-subtle p-[2px]"
    role="group"
    aria-label="Color theme"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="inline-flex items-center gap-[5px] rounded-full px-[9px] py-[6px] text-[11px] font-semibold transition-colors duration-[.15s] below-720:px-[7px]"
      :class="modelValue === option.value ? 'bg-surface text-clay-dark shadow-sm' : 'text-muted hover:text-ink'"
      :aria-pressed="modelValue === option.value"
      :title="`Use ${option.label.toLowerCase()} theme`"
      @click="emit('update:modelValue', option.value)"
    >
      <svg
        v-if="option.value === 'light'"
        class="h-[13px] w-[13px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.42" />
      </svg>
      <svg
        v-else-if="option.value === 'system'"
        class="h-[13px] w-[13px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      <svg
        v-else
        class="h-[13px] w-[13px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
      </svg>
      <span class="below-720:sr-only">{{ option.label }}</span>
    </button>
  </div>
</template>
