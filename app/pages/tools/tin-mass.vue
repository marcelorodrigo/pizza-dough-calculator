<script setup lang="ts">
import { createDefaultTinDoughMassState } from '../../domain/calculator-inputs'
import { isTinDoughMassCalculatorState } from '../../domain/calculator-persistence'
import { usePersistedCalculatorState } from '../../composables/usePersistedCalculatorState'

const calculator = usePersistedCalculatorState(
  'tin-mass',
  createDefaultTinDoughMassState,
  isTinDoughMassCalculatorState
)
</script>

<template>
  <PageHeader
    eyebrow="Right dough, right pan"
    title="Tin dough mass"
    description="Estimate the dough mass for a rectangular sheet pan or round pizza tin using its inside dimensions."
    badge="Baker’s tool"
  />
  <TinDoughMassCalculator v-model="calculator" />
  <CalculatorNavigation />
</template>
