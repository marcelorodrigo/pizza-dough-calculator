<script setup lang="ts">
import { createDefaultFlourStrengthState } from '../../domain/calculator-inputs'
import { isFlourStrengthCalculatorState } from '../../domain/calculator-persistence'
import { usePersistedCalculatorState } from '../../composables/usePersistedCalculatorState'

const calculator = usePersistedCalculatorState(
  'flour-strength',
  createDefaultFlourStrengthState,
  isFlourStrengthCalculatorState
)
</script>

<template>
  <PageHeader
    eyebrow="Strength in balance"
    title="Flour strength"
    description="Blend flours to reach a target W value, or calculate the strength of a flour mix you already have."
    badge="Baker’s tool"
  />
  <FlourStrengthCalculator v-model="calculator" />
  <CalculatorNavigation />
</template>
