<script setup lang="ts">
import { computed } from 'vue'
import NumberField from '../form/NumberField.vue'
import SelectField from '../form/SelectField.vue'
import SectionCard from '../ui/SectionCard.vue'
import {
  calculateWaterTemperature,
  setWaterTemperatureUnit,
  type WaterTemperatureInput
} from '../../domain/water-temperature'
import { validateWaterTemperatureInput } from '../../domain/secondary-validation'
import { formatTemperature } from '../../utils/format-results'
import { temperatureUnitOptions } from '../../utils/temperature-unit-options'

const model = defineModel<WaterTemperatureInput>({ required: true })
const errors = computed(() => validateWaterTemperatureInput(model.value))
const result = computed(() => Object.keys(errors.value).length === 0
  ? calculateWaterTemperature(model.value)
  : undefined)
const minimum = computed(() => model.value.temperatureUnit === 'C' ? 10 : 50)
const maximum = computed(() => model.value.temperatureUnit === 'C' ? 40 : 104)
const formattedResult = computed(() => result.value === undefined
  ? '–'
  : formatTemperature(result.value, model.value.temperatureUnit))

const mixerOptions = [
  { value: 'fork', label: 'Fork' },
  { value: 'spiral', label: 'Spiral' },
  { value: 'planetary', label: 'Planetary' },
  { value: 'plunging-arms', label: 'Plunging arms' },
  { value: 'hands', label: 'Hands' }
] as const

function update<K extends keyof WaterTemperatureInput>(key: K, value: WaterTemperatureInput[K]) {
  model.value = { ...model.value, [key]: value }
}

function changeUnit(unit: WaterTemperatureInput['temperatureUnit']) {
  model.value = setWaterTemperatureUnit(model.value, unit)
}
</script>

<template>
  <SectionCard
    class="water-tool"
    heading-id="water-temperature-heading"
    eyebrow="Tune your mix"
    title="Water temperature"
    step="01"
    variant="tool"
    copy="Balance room temperature and mixer friction to reach your desired final dough temperature."
  >
    <div class="field-grid field-grid--two">
      <SelectField
        label="Temperature unit"
        :options="temperatureUnitOptions"
        :model-value="model.temperatureUnit"
        @update:model-value="changeUnit($event as 'C' | 'F')"
      />
      <SelectField
        label="Mixer"
        :options="mixerOptions"
        :model-value="model.mixer"
        @update:model-value="update('mixer', $event as WaterTemperatureInput['mixer'])"
      />
      <NumberField
        id="desired-dough-temperature"
        label="Desired final dough temperature" :unit="`°${model.temperatureUnit}`"
        :model-value="model.desiredDoughTemperature" :min="minimum" :max="maximum" :step="0.5"
        :error="errors.desiredDoughTemperature"
        @update:model-value="update('desiredDoughTemperature', $event)"
      />
      <NumberField
        id="room-temperature"
        label="Room temperature" :unit="`°${model.temperatureUnit}`"
        :model-value="model.roomTemperature" :min="minimum" :max="maximum" :step="0.5"
        :error="errors.roomTemperature"
        @update:model-value="update('roomTemperature', $event)"
      />
    </div>
    <div class="result-strip result-strip--single" aria-live="polite">
      <div><span>Water temperature</span><output aria-label="Water temperature result">{{ formattedResult }}</output></div>
    </div>
    <p class="result-note">The calculated water temperature has a minimum of 4°C.</p>
  </SectionCard>
</template>
