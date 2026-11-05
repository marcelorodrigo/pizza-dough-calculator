<script setup lang="ts">
import { createDefaultWaterTemperatureState } from '../../domain/calculator-inputs'
import { isWaterTemperatureInput } from '../../domain/calculator-persistence'
import { usePersistedCalculatorState } from '../../composables/usePersistedCalculatorState'
import WaterTemperatureCalculator from '../../components/tools/WaterTemperatureCalculator.vue'
import CalculatorNavigation from '../../components/app/CalculatorNavigation.vue'

const calculator = usePersistedCalculatorState(
  'water-temperature',
  createDefaultWaterTemperatureState,
  isWaterTemperatureInput
)
</script>

<template>
  <section class="mb-[30px] flex items-end justify-between gap-[24px] below-720:mb-[22px] below-720:block" aria-labelledby="page-title">
    <div><p class="eyebrow m-0 mb-[9px] font-mono text-[10px] uppercase tracking-[0.13em] text-clay">Control the mix</p><h1 id="page-title" class="m-0 font-serif text-[clamp(34px,5vw,56px)] font-semibold leading-[1.08] tracking-[-.045em] below-720:text-[clamp(35px,10vw,47px)]">Water temperature</h1><p class="mb-0 mt-[12px] max-w-[420px] text-[14px] leading-[1.65] text-muted below-720:text-[13px]">Account for room temperature and mixer friction to bring your dough to the desired temperature.</p></div>
    <span class="inline-flex items-center gap-[8px] whitespace-nowrap rounded-full border border-line bg-[#fbf8f1] px-[13px] py-[10px] font-mono text-[10px] uppercase tracking-[0.05em] text-[#686156] below-720:mt-[15px]"><span class="h-[6px] w-[6px] rounded-full bg-[#7e8a67]" />Baker’s tool</span>
  </section>
  <WaterTemperatureCalculator v-model="calculator" />
  <CalculatorNavigation />
</template>
