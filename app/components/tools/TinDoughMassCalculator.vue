<script setup lang="ts">
import { computed } from 'vue'
import NumberField from '../form/NumberField.vue'
import SectionCard from '../ui/SectionCard.vue'
import { calculateRectangularTinMass, calculateRoundTinMass } from '../../domain/tin-dough-mass'
import type { TinDoughMassCalculatorState } from '../../domain/calculator-inputs'
import { validateTinDoughMassInput } from '../../domain/secondary-validation'
import { formatMass } from '../../utils/format-results'

const model = defineModel<TinDoughMassCalculatorState>({ required: true })
const errors = computed(() => validateTinDoughMassInput(model.value))
const rectangularResult = computed(() => Object.keys(errors.value).some(key => key.startsWith('rectangular.'))
  ? undefined
  : calculateRectangularTinMass(model.value.rectangular))
const roundResult = computed(() => Object.keys(errors.value).some(key => key.startsWith('round.'))
  ? undefined
  : calculateRoundTinMass(model.value.round))
const rectangularMass = computed(() => rectangularResult.value?.status === 'available'
  ? formatMass(rectangularResult.value.massGrams)
  : '–')
const roundMass = computed(() => roundResult.value?.status === 'available'
  ? formatMass(roundResult.value.massGrams)
  : '–')

function updateRectangular<K extends keyof TinDoughMassCalculatorState['rectangular']>(
  key: K,
  value: TinDoughMassCalculatorState['rectangular'][K]
) {
  model.value = { ...model.value, rectangular: { ...model.value.rectangular, [key]: value } }
}

function updateRound<K extends keyof TinDoughMassCalculatorState['round']>(
  key: K,
  value: TinDoughMassCalculatorState['round'][K]
) {
  model.value = { ...model.value, round: { ...model.value.round, [key]: value } }
}
</script>

<template>
  <div class="calculator-sections">
    <SectionCard
      heading-id="rectangular-tin-heading"
      eyebrow="For a sheet pan"
      title="Rectangular tin"
      step="01"
      variant="tool"
      copy="Estimate dough from the inside dimensions of your tin."
    >
      <div class="field-grid field-grid--three">
        <NumberField id="rectangular-side-1" label="Side 1" unit="cm" :model-value="model.rectangular.side1Cm" :min="0" :max="100" :step="1" :error="errors['rectangular.side1Cm']" @update:model-value="updateRectangular('side1Cm', $event)" />
        <NumberField id="rectangular-side-2" label="Side 2" unit="cm" :model-value="model.rectangular.side2Cm" :min="0" :max="100" :step="1" :error="errors['rectangular.side2Cm']" @update:model-value="updateRectangular('side2Cm', $event)" />
        <NumberField id="rectangular-adjustment" label="Adjustment" unit="%" :model-value="model.rectangular.adjustmentPercent" :min="-20" :max="20" :step="5" :error="errors['rectangular.adjustmentPercent']" @update:model-value="updateRectangular('adjustmentPercent', $event)" />
      </div>
      <div class="result-strip result-strip--single" aria-live="polite">
        <div><span>Suggested dough mass</span><output aria-label="Rectangular tin dough mass">{{ rectangularMass }}</output></div>
      </div>
    </SectionCard>

    <SectionCard
      heading-id="round-tin-heading"
      eyebrow="For a pizza pan"
      title="Round tin"
      step="02"
      variant="tool"
      copy="Use the tin diameter and adjust the result for your preferred dough thickness."
    >
      <div class="field-grid field-grid--two">
        <NumberField id="round-diameter" label="Diameter" unit="cm" :model-value="model.round.diameterCm" :min="0" :max="100" :step="1" :error="errors['round.diameterCm']" @update:model-value="updateRound('diameterCm', $event)" />
        <NumberField id="round-adjustment" label="Adjustment" unit="%" :model-value="model.round.adjustmentPercent" :min="-20" :max="20" :step="5" :error="errors['round.adjustmentPercent']" @update:model-value="updateRound('adjustmentPercent', $event)" />
      </div>
      <div class="result-strip result-strip--single" aria-live="polite">
        <div><span>Suggested dough mass</span><output aria-label="Round tin dough mass">{{ roundMass }}</output></div>
      </div>
    </SectionCard>
  </div>
</template>
