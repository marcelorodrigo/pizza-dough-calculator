<script setup lang="ts">
defineProps<{
  legend: string
  name: string
  options: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <fieldset class="yeast-fieldset">
    <legend>{{ legend }}</legend>
    <div class="radio-row">
      <label v-for="option in options" :key="option.value" class="radio-pill">
        <input
          type="radio"
          :name="name"
          :value="option.value"
          :checked="model === option.value"
          :disabled="option.disabled"
          @change="model = option.value"
        >
        {{ option.label }}
      </label>
    </div>
  </fieldset>
</template>
