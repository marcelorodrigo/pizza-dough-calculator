<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{
  label: string
  options: ReadonlyArray<{ value: string; label: string }>
  id?: string
  disabled?: boolean
}>()

const model = defineModel<string>({ required: true })
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
</script>

<template>
  <label class="select-field flex min-w-0 flex-col gap-[7px] text-[12px] font-semibold text-ink-soft" :for="inputId">
    <span>{{ label }}</span>
    <select
      :id="inputId"
      class="min-h-[43px] w-full rounded-[8px] border border-line-strong bg-surface px-[11px] py-[10px] text-[13px] font-normal text-ink"
      :value="model"
      :disabled="disabled"
      @change="model = ($event.target as HTMLSelectElement).value"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
