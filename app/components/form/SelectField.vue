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
  <label class="select-field" :for="inputId">
    <span>{{ label }}</span>
    <select
      :id="inputId"
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
