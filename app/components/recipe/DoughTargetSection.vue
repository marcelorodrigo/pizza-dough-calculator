<script setup lang="ts">
import NumberField from '../form/NumberField.vue'
import type { DoughRecipeInput, DoughStyle } from '../../domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../domain/dough-recipe/validation'

const props = defineProps<{
  modelValue: DoughRecipeInput['target']
  style: DoughStyle
  errors: DoughRecipeFieldErrors
}>()
const emit = defineEmits<{
  'update:modelValue': [value: DoughRecipeInput['target']]
  'update:style': [value: DoughStyle]
}>()

function update<K extends keyof DoughRecipeInput['target']>(
  key: K,
  value: DoughRecipeInput['target'][K]
) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <section class="form-card" aria-labelledby="target-heading">
    <div class="section-heading">
      <div><p class="eyebrow">Start with the bake</p><h2 id="target-heading">Dough target</h2></div>
      <span class="step-mark">01</span>
    </div>
    <div class="field-grid field-grid--two">
      <label class="select-field">
        <span>Dough style</span>
        <select :value="style" @change="$emit('update:style', ($event.target as HTMLSelectElement).value as DoughStyle)">
          <option value="Neapolitan">Neapolitan</option>
          <option value="Teglia">Teglia</option>
        </select>
      </label>
      <NumberField
        label="Wastage" unit="%" :model-value="modelValue.wastagePercent" :min="0" :max="5" :step="1"
        :error="errors['target.wastagePercent']" @update:model-value="update('wastagePercent', $event)"
      />
    </div>

    <div class="inline-fields">
      <NumberField label="Ball count" :model-value="modelValue.firstBallCount" :min="1" :max="200" :step="1" :error="errors['target.firstBallCount']" @update:model-value="update('firstBallCount', $event)" />
      <NumberField label="Ball weight" unit="g" :model-value="modelValue.firstBallWeightGrams" :min="10" :max="1500" :step="5" :error="errors['target.firstBallWeightGrams']" @update:model-value="update('firstBallWeightGrams', $event)" />
    </div>

    <div class="check-row" style="margin-top: 16px">
      <label class="check-control"><input type="checkbox" :checked="modelValue.secondGroupEnabled" @change="update('secondGroupEnabled', ($event.target as HTMLInputElement).checked)">Add a second ball size</label>
    </div>
    <div v-if="modelValue.secondGroupEnabled" class="inline-fields">
      <NumberField label="Second ball count" :model-value="modelValue.secondBallCount" :min="1" :max="200" :step="1" :error="errors['target.secondBallCount']" @update:model-value="update('secondBallCount', $event)" />
      <NumberField label="Second ball weight" unit="g" :model-value="modelValue.secondBallWeightGrams" :min="10" :max="1500" :step="5" :error="errors['target.secondBallWeightGrams']" @update:model-value="update('secondBallWeightGrams', $event)" />
    </div>

    <hr class="field-divider">
    <div class="field-grid field-grid--two">
      <NumberField label="Old dough out" unit="g" :model-value="modelValue.oldDoughOutGrams" :min="0" :max="500" :step="10" :error="errors['target.oldDoughOutGrams']" @update:model-value="update('oldDoughOutGrams', $event)" />
      <label class="check-control old-dough-toggle"><input type="checkbox" :checked="modelValue.oldDoughInEnabled" @change="update('oldDoughInEnabled', ($event.target as HTMLInputElement).checked)">Include old dough in</label>
    </div>
    <div v-if="modelValue.oldDoughInEnabled" class="inline-fields">
      <NumberField label="Old dough in" unit="%" :model-value="modelValue.oldDoughInPercent" :min="0" :max="20" :step="1" :error="errors['target.oldDoughInPercent']" @update:model-value="update('oldDoughInPercent', $event)" />
      <label class="select-field">
        <span>Old dough strength</span>
        <select :value="modelValue.oldDoughStrength" @change="update('oldDoughStrength', ($event.target as HTMLSelectElement).value as 'low' | 'high')">
          <option value="low">Low</option>
          <option value="high">High</option>
        </select>
      </label>
    </div>
  </section>
</template>
