<script setup lang="ts">
import CheckboxField from '../form/CheckboxField.vue'
import NumberField from '../form/NumberField.vue'
import SelectField from '../form/SelectField.vue'
import SectionCard from '../ui/SectionCard.vue'
import type { DoughRecipeInput, DoughStyleId } from '../../domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../domain/dough-recipe/validation'

const styleOptions = [
  { value: 'neapolitan', label: 'Neapolitan' },
  { value: 'pan-pizza', label: 'Pan Pizza' }
] as const satisfies ReadonlyArray<{ value: DoughStyleId; label: string }>

const oldDoughStrengthOptions = [
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' }
] as const

const props = defineProps<{
  modelValue: DoughRecipeInput['target']
  style: DoughStyleId
  errors: DoughRecipeFieldErrors
}>()
const emit = defineEmits<{
  'update:modelValue': [value: DoughRecipeInput['target']]
  'update:style': [value: DoughStyleId]
}>()

function update<K extends keyof DoughRecipeInput['target']>(
  key: K,
  value: DoughRecipeInput['target'][K]
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <SectionCard heading-id="target-heading" eyebrow="Start with the bake" title="Dough target" step="01">
    <div class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
      <SelectField
        label="Dough style"
        :options="styleOptions"
        :model-value="style"
        @update:model-value="$emit('update:style', $event as DoughStyleId)"
      />
      <NumberField
        label="Wastage" unit="%" :model-value="modelValue.wastagePercent" :min="0" :max="5" :step="1"
        :error="errors['target.wastagePercent']" @update:model-value="update('wastagePercent', $event)"
      />
    </div>

    <div class="mt-[14px] grid grid-cols-2 gap-[12px] below-420:grid-cols-1">
      <NumberField label="Ball count" :model-value="modelValue.firstBallCount" :min="1" :max="200" :step="1" :error="errors['target.firstBallCount']" @update:model-value="update('firstBallCount', $event)" />
      <NumberField label="Ball weight" unit="g" :model-value="modelValue.firstBallWeightGrams" :min="10" :max="1500" :step="5" :error="errors['target.firstBallWeightGrams']" @update:model-value="update('firstBallWeightGrams', $event)" />
    </div>

    <div class="mt-[16px] mb-[16px] flex flex-wrap gap-x-[20px] gap-y-[12px]">
      <CheckboxField
        label="Add a second ball size"
        :model-value="modelValue.secondGroupEnabled"
        @update:model-value="update('secondGroupEnabled', $event)"
      />
    </div>
    <div v-if="modelValue.secondGroupEnabled" class="mt-[14px] grid grid-cols-2 gap-[12px] below-420:grid-cols-1">
      <NumberField label="Second ball count" :model-value="modelValue.secondBallCount" :min="1" :max="200" :step="1" :error="errors['target.secondBallCount']" @update:model-value="update('secondBallCount', $event)" />
      <NumberField label="Second ball weight" unit="g" :model-value="modelValue.secondBallWeightGrams" :min="10" :max="1500" :step="5" :error="errors['target.secondBallWeightGrams']" @update:model-value="update('secondBallWeightGrams', $event)" />
    </div>

    <hr class="my-[18px] border-t border-[#eee9e0]">
    <div class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
      <NumberField label="Old dough out" unit="g" :model-value="modelValue.oldDoughOutGrams" :min="0" :max="500" :step="10" :error="errors['target.oldDoughOutGrams']" @update:model-value="update('oldDoughOutGrams', $event)" />
      <CheckboxField
        label="Include old dough in"
        :model-value="modelValue.oldDoughInEnabled"
        @update:model-value="update('oldDoughInEnabled', $event)"
      />
    </div>
    <div v-if="modelValue.oldDoughInEnabled" class="mt-[14px] grid grid-cols-2 gap-[12px] below-420:grid-cols-1">
      <NumberField label="Old dough in" unit="%" :model-value="modelValue.oldDoughInPercent" :min="0" :max="20" :step="1" :error="errors['target.oldDoughInPercent']" @update:model-value="update('oldDoughInPercent', $event)" />
      <SelectField
        label="Old dough strength"
        :options="oldDoughStrengthOptions"
        :model-value="modelValue.oldDoughStrength"
        @update:model-value="update('oldDoughStrength', $event as DoughRecipeInput['target']['oldDoughStrength'])"
      />
    </div>
  </SectionCard>
</template>
