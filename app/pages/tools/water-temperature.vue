<script setup lang="ts">
import { createDefaultWaterTemperatureState } from '../../domain/calculator-inputs'
import { isWaterTemperatureInput } from '../../domain/calculator-persistence'
import { usePersistedCalculatorState } from '../../composables/usePersistedCalculatorState'

const calculator = usePersistedCalculatorState(
  'water-temperature',
  createDefaultWaterTemperatureState,
  isWaterTemperatureInput
)
</script>

<template>
  <PageHeader
    eyebrow="Control the mix"
    title="Water temperature"
    description="Account for room temperature and mixer friction to bring your dough to the desired temperature."
    badge="Baker’s tool"
  />
  <WaterTemperatureCalculator v-model="calculator" />
  <CalculatorNavigation />
</template>
