<script setup lang="ts">
import { computed } from 'vue'
import CheckboxField from '../form/CheckboxField.vue'
import NumberField from '../form/NumberField.vue'
import RadioGroupField from '../form/RadioGroupField.vue'
import SelectField from '../form/SelectField.vue'
import SectionCard from '../ui/SectionCard.vue'
import type { DoughRecipeInput, TemperatureUnit, YeastType } from '../../domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../domain/dough-recipe/validation'
import { temperatureUnitOptions } from '../../utils/temperature-unit-options'

const props = defineProps<{
  modelValue: DoughRecipeInput['fermentation']
  yeast: DoughRecipeInput['yeast']
  sourdoughDisabled: boolean
  errors: DoughRecipeFieldErrors
}>()
const emit = defineEmits<{
  'update:modelValue': [value: DoughRecipeInput['fermentation']]
  'update:yeast': [value: DoughRecipeInput['yeast']]
  'unit-change': [value: TemperatureUnit]
}>()

const yeastChoices: ReadonlyArray<{ value: YeastType; label: string }> = [
  { value: 'LBF', label: 'Compressed' },
  { value: 'LSI', label: 'Instant dry' },
  { value: 'LSA', label: 'Active dry' },
  { value: 'LMS', label: 'Stiff sourdough · 50% hydration' },
  { value: 'LML', label: 'Liquid sourdough · 100% hydration' }
]

const temperatureMinimum = computed(() => props.modelValue.temperatureUnit === 'C' ? 10 : 50)
const temperatureMaximum = computed(() => props.modelValue.temperatureUnit === 'C' ? 40 : 104)
const controlledMinimum = computed(() => props.modelValue.temperatureUnit === 'C' ? 1 : 34)
const controlledMaximum = computed(() => props.modelValue.temperatureUnit === 'C' ? 20 : 68)
const yeastOptions = computed(() => yeastChoices.map(choice => ({
  ...choice,
  disabled: props.sourdoughDisabled && (choice.value === 'LMS' || choice.value === 'LML')
})))

function update<K extends keyof DoughRecipeInput['fermentation']>(
  key: K,
  value: DoughRecipeInput['fermentation'][K]
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function updateYeast<K extends keyof DoughRecipeInput['yeast']>(
  key: K,
  value: DoughRecipeInput['yeast'][K]
) {
  emit('update:yeast', { ...props.yeast, [key]: value })
}
</script>

<template>
  <SectionCard heading-id="fermentation-heading" eyebrow="Plan the rise" title="Fermentation & yeast" step="03">
    <div class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
      <NumberField label="Room fermentation time" unit="h" :model-value="modelValue.roomHours" :min="1" :max="100" :step="1" :error="errors['fermentation.roomHours']" @update:model-value="update('roomHours', $event)" />
      <NumberField label="Room temperature" :unit="`°${modelValue.temperatureUnit}`" :model-value="modelValue.roomTemperature" :min="temperatureMinimum" :max="temperatureMaximum" :step="0.5" :error="errors['fermentation.roomTemperature']" @update:model-value="update('roomTemperature', $event)" />
    </div>

    <div class="mt-[16px] mb-[16px] flex flex-wrap gap-x-[20px] gap-y-[12px]">
      <CheckboxField
        label="Add controlled-temperature fermentation"
        :model-value="modelValue.controlledEnabled"
        @update:model-value="update('controlledEnabled', $event)"
      />
      <SelectField
        class="ml-auto w-[min(220px,100%)]"
        label="Temperature unit"
        :options="temperatureUnitOptions"
        :model-value="modelValue.temperatureUnit"
        @update:model-value="$emit('unit-change', $event as TemperatureUnit)"
      />
    </div>
    <div v-if="modelValue.controlledEnabled" class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
      <NumberField label="Controlled fermentation time" unit="h" :model-value="modelValue.controlledHours" :min="0" :max="100" :step="1" :error="errors['fermentation.controlledHours']" @update:model-value="update('controlledHours', $event)" />
      <NumberField label="Controlled temperature" :unit="`°${modelValue.temperatureUnit}`" :model-value="modelValue.controlledTemperature" :min="controlledMinimum" :max="controlledMaximum" :step="0.5" :error="errors['fermentation.controlledTemperature']" @update:model-value="update('controlledTemperature', $event)" />
    </div>

    <hr class="my-[18px] border-t border-line-subtle">
    <RadioGroupField
      legend="Yeast type"
      name="dough-yeast-type"
      :options="yeastOptions"
      :model-value="yeast.type"
      @update:model-value="updateYeast('type', $event as YeastType)"
    />
    <NumberField class="mt-[16px] max-w-[260px]" label="Yeast adjustment" unit="%" :model-value="yeast.adjustmentPercent" :min="-50" :max="50" :step="5" :error="errors['yeast.adjustmentPercent']" @update:model-value="updateYeast('adjustmentPercent', $event)" />
  </SectionCard>
</template>
