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
    class="mx-auto w-[min(720px,100%)]"
    heading-id="water-temperature-heading"
    eyebrow="Tune your mix"
    title="Water temperature"
    step="01"
    variant="tool"
    copy="Balance room temperature and mixer friction to reach your desired final dough temperature."
  >
    <div class="grid grid-cols-2 gap-[14px] below-420:grid-cols-1">
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
    <div class="mt-[19px] grid grid-cols-1 rounded-[10px] border border-[#e9e0d3] bg-[#faf6ee]" aria-live="polite">
      <div class="flex items-center justify-between gap-[12px] px-[15px] py-[13px] below-420:p-[11px]"><span class="text-[12px] text-[#71685c]">Water temperature</span><output class="font-mono text-[19px] font-medium text-olive" aria-label="Water temperature result">{{ formattedResult }}</output></div>
    </div>
    <p class="mb-0 mt-[12px] text-[11px] text-[#8b8378]">The calculated water temperature has a minimum of 4°C.</p>
  </SectionCard>
</template>
