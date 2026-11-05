<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{
  label: string
  min?: number
  max?: number
  step?: number
  unit?: string
  error?: string
  disabled?: boolean
  id?: string
}>()

const model = defineModel<number>({ required: true })
const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const errorId = computed(() => `${inputId.value}-error`)
</script>

<template>
  <label class="number-field flex min-w-0 flex-col gap-[7px] text-[12px] font-semibold text-[#514a41]" :for="inputId">
    <span class="flex items-baseline justify-between gap-[8px]">{{ label }}<span v-if="unit" class="font-mono text-[10px] font-normal text-[#9a9186]">{{ unit }}</span></span>
    <input
      :id="inputId"
      class="min-h-[43px] w-full rounded-[8px] border border-[#ddd6ca] bg-[#fffefa] px-[11px] py-[10px] font-mono text-[13px] font-normal text-ink disabled:bg-[#f3f0ea] disabled:text-[#a49c92] aria-invalid:border-clay"
      :value="Number.isFinite(model) ? model : ''"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @input="model = ($event.target as HTMLInputElement).valueAsNumber"
    >
    <span v-if="error" :id="errorId" class="text-[11px] font-medium leading-[1.35] text-[#9b3b2a]" role="alert">{{ error }}</span>
  </label>
</template>
