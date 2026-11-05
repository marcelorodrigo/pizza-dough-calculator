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
  <label class="check-control" :for="inputId">
    <input
      :id="inputId"
      type="checkbox"
      :checked="model"
      :disabled="disabled"
      :aria-label="ariaLabel"
      @change="model = ($event.target as HTMLInputElement).checked"
    >
    {{ label }}
  </label>
</template>
