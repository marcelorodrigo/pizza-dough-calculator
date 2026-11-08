<script setup lang="ts">
import type { DoughRecipeInput } from '../../domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../domain/dough-recipe/validation'

const props = defineProps<{
  modelValue: DoughRecipeInput['ingredients']
  errors: DoughRecipeFieldErrors
}>()
const emit = defineEmits<{
  'update:modelValue': [value: DoughRecipeInput['ingredients']]
  'flour-count-change': [count: number]
}>()

const flourCountOptions = Array.from({ length: 6 }, (_, index) => {
  const count = index + 1
  return { value: String(count), label: `${count} ${count === 1 ? 'flour' : 'flours'}` }
})

function update<K extends keyof DoughRecipeInput['ingredients']>(
  key: K,
  value: DoughRecipeInput['ingredients'][K]
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function updateShare(index: number, value: number) {
  const flourShares = [...props.modelValue.flourShares]
  flourShares[index] = value
  emit('update:modelValue', { ...props.modelValue, flourShares })
}
</script>

<template>
  <SectionCard heading-id="flour-heading" eyebrow="Build the base" title="Flour & ingredients" step="02">
    <div class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
      <SelectField
        label="Number of flours"
        :options="flourCountOptions"
        :model-value="String(modelValue.flourCount)"
        @update:model-value="$emit('flour-count-change', Number($event))"
      />
      <NumberField label="Hydration" unit="%" :model-value="modelValue.hydrationPercent" :min="40" :max="100" :step="1" :error="errors['ingredients.hydrationPercent']" @update:model-value="update('hydrationPercent', $event)" />
      <NumberField label="Salt" unit="%" :model-value="modelValue.saltPercent" :min="0" :max="6" :step="0.1" :error="errors['ingredients.saltPercent']" @update:model-value="update('saltPercent', $event)" />
      <NumberField label="Fat" unit="%" :model-value="modelValue.fatPercent" :min="0" :max="10" :step="0.1" :disabled="!modelValue.fatEnabled" :error="errors['ingredients.fatPercent']" @update:model-value="update('fatPercent', $event)" />
    </div>
    <div class="mt-[16px] mb-[16px] flex flex-wrap gap-x-[20px] gap-y-[12px]">
      <CheckboxField
        label="Add fat to the dough"
        :model-value="modelValue.fatEnabled"
        @update:model-value="update('fatEnabled', $event)"
      />
    </div>
    <div v-if="modelValue.flourCount > 1">
      <p class="my-4">Shares must total exactly 100% for individual amounts.</p>
      <div class="grid grid-cols-3 gap-[14px] below-720:grid-cols-2 below-420:grid-cols-1">
        <NumberField
          v-for="index in modelValue.flourCount" :key="index"
          :label="`Flour ${index} share`" unit="%"
          :model-value="modelValue.flourShares[index - 1] ?? 1" :min="1" :max="99" :step="1"
          :error="errors[`ingredients.flourShares.${index - 1}`]"
          @update:model-value="updateShare(index - 1, $event)"
        />
      </div>
    </div>
  </SectionCard>
</template>
