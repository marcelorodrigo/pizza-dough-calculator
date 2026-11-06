<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{
  label: string
  id?: string
  disabled?: boolean
  ariaLabel?: string
}>()

const model = defineModel<boolean>({ required: true })
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
</script>

<template>
  <label class="check-control flex min-h-[24px] items-center gap-[12px] text-[12px] font-semibold text-ink-soft" :for="inputId">
    <input
      :id="inputId"
      class="h-[16px] w-[16px] accent-clay"
      type="checkbox"
      :checked="model"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @change="model = ($event.target as HTMLInputElement).checked"
    >
    {{ label }}
  </label>
</template>
