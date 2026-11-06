<script setup lang="ts">
import { computed } from 'vue'
import NumberField from '../form/NumberField.vue'
import SectionCard from '../ui/SectionCard.vue'
import {
  calculateFlourStrengthBlend,
  calculateWeightedFlourStrength
} from '../../domain/flour-strength'
import type { FlourStrengthCalculatorState } from '../../domain/calculator-inputs'
import { validateFlourStrengthInput } from '../../domain/secondary-validation'
import { formatPercent } from '../../utils/format-results'

const model = defineModel<FlourStrengthCalculatorState>({ required: true })
const errors = computed(() => validateFlourStrengthInput(model.value))
const blendResult = computed(() => Object.keys(errors.value).some(key => key.startsWith('blend.'))
  ? { status: 'unavailable' as const }
  : calculateFlourStrengthBlend(model.value.blend))
const flour1ShareDisplay = computed(() => blendResult.value.status === 'available'
  ? blendShare(blendResult.value.flour1SharePercent)
  : '–')
const flour2ShareDisplay = computed(() => blendResult.value.status === 'available'
  ? blendShare(blendResult.value.flour2SharePercent)
  : '–')
const weightedResult = computed(() => Object.keys(errors.value).some(key => key.startsWith('weighted.'))
  ? { status: 'unavailable' as const }
  : calculateWeightedFlourStrength(model.value.weighted))
const weightedDisplay = computed(() => weightedResult.value.status === 'available'
  ? Number(weightedResult.value.strengthW.toFixed(0)).toString()
  : '–')

function updateBlend<K extends keyof FlourStrengthCalculatorState['blend']>(
  key: K,
  value: FlourStrengthCalculatorState['blend'][K]
) {
  model.value = { ...model.value, blend: { ...model.value.blend, [key]: value } }
}

function updateWeighted<K extends 'sharesPercent' | 'strengthsW'>(
  key: K,
  index: number,
  value: number
) {
  const values = [...model.value.weighted[key]] as [number, number, number, number]
  values[index] = value
  model.value = { ...model.value, weighted: { ...model.value.weighted, [key]: values } }
}

function blendShare(value: number | undefined): string {
  return value === undefined ? '–' : formatPercent(Number(value.toFixed(0)))
}
</script>

<template>
  <div class="grid grid-cols-2 items-start gap-[16px] below-720:grid-cols-1">
    <SectionCard
      heading-id="blend-heading"
      eyebrow="Blend two flours"
      title="Reach a target W"
      step="01"
      variant="tool"
      copy="Find the proportions of two flours needed to hit your target strength."
    >
      <div class="grid grid-cols-3 gap-[14px] below-720:grid-cols-2 below-420:grid-cols-1">
        <NumberField
          id="target-w"
          label="Target W" :model-value="model.blend.targetW" :min="100" :max="500" :step="10"
          :error="errors['blend.targetW']"
          @update:model-value="updateBlend('targetW', $event)"
        />
        <NumberField
          id="flour-1-w"
          label="Flour 1 W" :model-value="model.blend.flour1W" :min="100" :max="500" :step="10"
          :error="errors['blend.flour1W']"
          @update:model-value="updateBlend('flour1W', $event)"
        />
        <NumberField
          id="flour-2-w"
          label="Flour 2 W" :model-value="model.blend.flour2W" :min="100" :max="500" :step="10"
          :error="errors['blend.flour2W']"
          @update:model-value="updateBlend('flour2W', $event)"
        />
      </div>
      <div class="mt-[19px] grid grid-cols-2 rounded-[10px] border border-line-strong bg-surface-subtle" aria-live="polite">
        <div class="flex items-center justify-between gap-[12px] px-[15px] py-[13px] below-420:p-[11px]"><span class="text-[12px] text-ink-secondary">Flour 1 share</span><output class="font-mono text-[19px] font-medium text-olive" aria-label="Flour 1 share">{{ flour1ShareDisplay }}</output></div>
        <div class="flex items-center justify-between gap-[12px] border-l border-line-strong px-[15px] py-[13px] below-420:p-[11px]"><span class="text-[12px] text-ink-secondary">Flour 2 share</span><output class="font-mono text-[19px] font-medium text-olive" aria-label="Flour 2 share">{{ flour2ShareDisplay }}</output></div>
      </div>
    </SectionCard>

    <SectionCard
      heading-id="weighted-heading"
      eyebrow="Already have a blend?"
      title="Calculate its W"
      step="02"
      variant="tool"
      copy="Enter each flour’s percentage. Shares must add up to exactly 100%."
    >
      <div class="grid grid-cols-4 gap-[14px] below-960:grid-cols-2 below-420:grid-cols-2">
        <div v-for="index in 4" :key="index" class="grid content-start gap-[12px] rounded-[10px] border border-line-subtle bg-surface-subtle p-[12px]">
          <h3 class="m-0 font-mono text-[10px] font-normal uppercase text-muted">Flour {{ index }}</h3>
          <NumberField
            :label="`Flour ${index} share`"
            :id="`flour-${index}-share`"
            :model-value="model.weighted.sharesPercent[index - 1]!"
            :min="0" :max="100" :step="10" unit="%"
            :error="errors[`weighted.shares.${index}`]"
            @update:model-value="updateWeighted('sharesPercent', index - 1, $event)"
          />
          <NumberField
            :label="`Flour ${index} W`"
            :id="`flour-${index}-strength`"
            :model-value="model.weighted.strengthsW[index - 1]!"
            :min="100" :max="500" :step="10"
            :error="errors[`weighted.strengths.${index}`]"
            @update:model-value="updateWeighted('strengthsW', index - 1, $event)"
          />
        </div>
      </div>
      <div class="mt-[19px] grid grid-cols-1 rounded-[10px] border border-line-strong bg-surface-subtle" aria-live="polite">
        <div class="flex items-center justify-between gap-[12px] px-[15px] py-[13px] below-420:p-[11px]"><span class="text-[12px] text-ink-secondary">Weighted flour strength</span><output class="font-mono text-[19px] font-medium text-olive" aria-label="Weighted flour strength">{{ weightedDisplay }}</output></div>
      </div>
    </SectionCard>
  </div>
</template>
