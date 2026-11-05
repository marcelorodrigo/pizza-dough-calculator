<script setup lang="ts">
import CheckboxField from '../form/CheckboxField.vue'
import NumberField from '../form/NumberField.vue'
import SectionCard from '../ui/SectionCard.vue'
import type { DoughRecipeInput, PrefermentType } from '../../domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../domain/dough-recipe/validation'

const props = defineProps<{
  modelValue: DoughRecipeInput['preferments']
  errors: DoughRecipeFieldErrors
}>()
const emit = defineEmits<{
  'update:modelValue': [value: DoughRecipeInput['preferments']]
  'toggle-preferment': [value: 'autolysis' | PrefermentType]
}>()

function update<K extends keyof DoughRecipeInput['preferments']>(
  key: K,
  value: DoughRecipeInput['preferments'][K]
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <SectionCard
    heading-id="preferments-heading"
    eyebrow="Mix ahead"
    title="Preferments"
    step="04"
    copy="Autolysis can be combined with either poolish or biga. Flour allocations use total recipe flour."
  >
    <div class="preferment-option">
      <CheckboxField
        label="Autolysis"
        aria-label="Autolysis"
        :model-value="modelValue.autolysisEnabled"
        @update:model-value="$emit('toggle-preferment', 'autolysis')"
      />
      <div v-if="modelValue.autolysisEnabled" class="field-grid field-grid--two preferment-option__fields">
        <NumberField label="Autolysis flour" unit="%" :model-value="modelValue.autolysisFlourPercent" :min="20" :max="100" :step="1" :error="errors['preferments.autolysisFlourPercent']" @update:model-value="update('autolysisFlourPercent', $event)" />
        <NumberField label="Autolysis water (of flour)" unit="%" :model-value="modelValue.autolysisWaterPercent" :min="40" :max="100" :step="1" :error="errors['preferments.autolysisWaterPercent']" @update:model-value="update('autolysisWaterPercent', $event)" />
      </div>
    </div>

    <div class="preferment-option">
      <CheckboxField
        label="Poolish"
        aria-label="Poolish"
        :model-value="modelValue.poolishEnabled"
        @update:model-value="$emit('toggle-preferment', 'poolish')"
      />
      <div v-if="modelValue.poolishEnabled" class="field-grid field-grid--two preferment-option__fields">
        <NumberField label="Poolish flour" unit="%" :model-value="modelValue.poolishFlourPercent" :min="10" :max="100" :step="1" :error="errors['preferments.poolishFlourPercent']" @update:model-value="update('poolishFlourPercent', $event)" />
        <NumberField label="Poolish fermentation time" unit="h" :model-value="modelValue.poolishHours" :min="1" :max="24" :step="1" :error="errors['preferments.poolishHours']" @update:model-value="update('poolishHours', $event)" />
      </div>
    </div>

    <div class="preferment-option">
      <CheckboxField
        label="Biga"
        aria-label="Biga"
        :model-value="modelValue.bigaEnabled"
        @update:model-value="$emit('toggle-preferment', 'biga')"
      />
      <div v-if="modelValue.bigaEnabled" class="field-grid field-grid--two preferment-option__fields">
        <NumberField label="Biga flour" unit="%" :model-value="modelValue.bigaFlourPercent" :min="10" :max="100" :step="1" :error="errors['preferments.bigaFlourPercent']" @update:model-value="update('bigaFlourPercent', $event)" />
      </div>
    </div>
  </SectionCard>
</template>
