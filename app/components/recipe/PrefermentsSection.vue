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

/** Emits the preferment state with one field replaced. */
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
    <div class="grid gap-[12px] py-[13px]">
      <CheckboxField
        label="Autolysis"
        aria-label="Autolysis"
        :model-value="modelValue.autolysisEnabled"
        @update:model-value="$emit('toggle-preferment', 'autolysis')"
      />
      <div v-if="modelValue.autolysisEnabled" class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
        <NumberField label="Autolysis flour" unit="%" :model-value="modelValue.autolysisFlourPercent" :min="20" :max="100" :step="1" :error="errors['preferments.autolysisFlourPercent']" @update:model-value="update('autolysisFlourPercent', $event)" />
        <NumberField label="Autolysis water (of flour)" unit="%" :model-value="modelValue.autolysisWaterPercent" :min="40" :max="100" :step="1" :error="errors['preferments.autolysisWaterPercent']" @update:model-value="update('autolysisWaterPercent', $event)" />
      </div>
    </div>

    <div class="grid gap-[12px] border-t border-line-subtle py-[13px]">
      <CheckboxField
        label="Poolish"
        aria-label="Poolish"
        :model-value="modelValue.poolishEnabled"
        @update:model-value="$emit('toggle-preferment', 'poolish')"
      />
      <div v-if="modelValue.poolishEnabled" class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
        <NumberField label="Poolish flour" unit="%" :model-value="modelValue.poolishFlourPercent" :min="10" :max="100" :step="1" :error="errors['preferments.poolishFlourPercent']" @update:model-value="update('poolishFlourPercent', $event)" />
        <NumberField label="Poolish fermentation time" unit="h" :model-value="modelValue.poolishHours" :min="1" :max="24" :step="1" :error="errors['preferments.poolishHours']" @update:model-value="update('poolishHours', $event)" />
      </div>
    </div>

    <div class="grid gap-[12px] border-t border-line-subtle py-[13px]">
      <CheckboxField
        label="Biga"
        aria-label="Biga"
        :model-value="modelValue.bigaEnabled"
        @update:model-value="$emit('toggle-preferment', 'biga')"
      />
      <div v-if="modelValue.bigaEnabled" class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
        <NumberField label="Biga flour" unit="%" :model-value="modelValue.bigaFlourPercent" :min="10" :max="100" :step="1" :error="errors['preferments.bigaFlourPercent']" @update:model-value="update('bigaFlourPercent', $event)" />
      </div>
    </div>
  </SectionCard>
</template>
