<script setup lang="ts">
defineProps<{
  legend: string
  name: string
  options: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>
}>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <fieldset class="m-0 border-0 p-0">
    <legend class="mb-[10px] text-[12px] font-semibold text-[#514a41]">{{ legend }}</legend>
    <div class="flex flex-wrap gap-[8px]">
      <label
        v-for="option in options"
        :key="option.value"
        class="inline-flex items-center gap-[10px] rounded-full border border-line px-[11px] py-[8px] text-[11px] text-[#625b51] has-checked:border-[#bd8061] has-checked:bg-[#fbf1e8] has-checked:text-clay-dark"
      >
        <input
          class="accent-clay"
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
