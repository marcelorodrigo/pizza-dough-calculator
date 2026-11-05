<script setup lang="ts">
import type { DoughRecipeInput, DoughRecipeResult } from '../../domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../domain/dough-recipe/validation'
import { DOUGH_WARNING_LABELS, formatMass, formatSaltMass, formatYeastMass } from '../../utils/format-results'

defineProps<{
  result: DoughRecipeResult | null
  errors: DoughRecipeFieldErrors
  targetLabel: string
  yeastType: DoughRecipeInput['yeast']['type']
}>()
</script>

<template>
  <section
    class="sticky top-[94px] overflow-hidden rounded-[15px] border border-line bg-paper shadow-[0_8px_24px_rgba(64,46,26,0.035)] below-720:static below-720:row-start-1"
    aria-labelledby="results-heading"
    aria-live="polite"
  >
    <header class="bg-[#424a3c] px-[22px] pb-[18px] pt-[22px] text-[#fff9ef] below-420:px-[17px]">
      <p class="eyebrow m-0 mb-[9px] font-mono text-[10px] uppercase tracking-[0.13em] text-[#d1b194]">Your formula</p>
      <h2 id="results-heading" class="m-0 font-serif text-[25px] font-medium">Dough recipe</h2>
      <div class="mt-[17px] flex items-baseline justify-between gap-[15px] border-t border-[#ffffff2c] pt-[15px]">
        <span class="text-[12px] text-[#d6d7ca]">{{ result ? 'Target dough mass' : 'Recipe status' }}</span>
        <strong class="font-mono text-[25px] font-medium">{{ result ? formatMass(result.targetMassGrams) : 'Needs attention' }}</strong>
      </div>
      <p v-if="result" class="target-detail mb-0 mt-[8px] text-[11px] text-[#d6d7ca]">{{ targetLabel }}</p>
    </header>

    <div class="px-[22px] pb-[22px] pt-[19px] below-420:px-[17px]">
      <p v-if="!result" class="mb-[16px] mt-0 rounded-[8px] border border-[#dfb6a1] bg-[#fff2eb] px-[13px] py-[11px] text-[12px] text-[#8c402b]" role="alert">
        {{ Object.keys(errors).length }} {{ Object.keys(errors).length === 1 ? 'input needs' : 'inputs need' }} attention. Correct the highlighted fields to calculate this recipe.
      </p>
      <template v-else>
        <dl class="m-0 grid gap-0">
          <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[10px] uppercase tracking-[0.09em] text-[#8b8173]">Total dough</dt><dd class="m-0 font-mono text-[11px] text-clay-dark">{{ formatMass(result.newDoughMassGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[10px] uppercase tracking-[0.09em] text-[#8b8173]">Total flour</dt><dd class="m-0 font-mono text-[11px] text-clay-dark">{{ formatMass(result.totalFlourGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Main dough flour</dt><dd class="m-0 font-mono text-[14px] text-ink" aria-label="Main dough flour">{{ formatMass(result.mainDough.flourGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.mainDough.waterGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Salt</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatSaltMass(result.mainDough.saltGrams) }}</dd></div>
          <div v-if="result.mainDough.fatGrams > 0" class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Fat</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.mainDough.fatGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">{{ yeastType === 'LMS' || yeastType === 'LML' ? 'Sourdough starter' : 'Main dough yeast' }}</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatYeastMass(result.mainDough.yeastGrams, result.preferments.poolish.flourGrams > 0 || result.preferments.biga.flourGrams > 0) }}</dd></div>
          <div v-if="result.oldDoughInMassGrams > 0" class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Old dough in</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.oldDoughInMassGrams) }}</dd></div>
          <div v-if="result.oldDoughOutMassGrams > 0" class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Old dough out</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.oldDoughOutMassGrams) }}</dd></div>
        </dl>

        <template v-if="result.flourMix.status !== 'single'">
          <h3 class="mb-[5px] mt-[19px] flex items-center gap-[8px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a8073] before:h-[1px] before:w-[13px] before:bg-[#bd8061] before:content-['']">Main dough flour mix</h3>
          <dl class="m-0 grid gap-0">
            <div v-for="(amount, index) in result.flourMix.flourGrams" :key="index" class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]">
              <dt class="text-[12px] text-[#645d54]">Flour {{ index + 1 }}</dt><dd class="m-0 font-mono text-[14px] text-ink" :aria-label="`Flour ${index + 1} amount`">{{ formatMass(amount) }}</dd>
            </div>
          </dl>
        </template>

        <template v-if="result.preferments.autolysis.flourGrams || result.preferments.poolish.flourGrams || result.preferments.biga.flourGrams">
          <h3 class="mb-[5px] mt-[19px] flex items-center gap-[8px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a8073] before:h-[1px] before:w-[13px] before:bg-[#bd8061] before:content-['']">Prepare separately</h3>
          <dl class="m-0 grid gap-0">
            <template v-if="result.preferments.autolysis.flourGrams">
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Autolysis flour</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.autolysis.flourGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Autolysis water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.autolysis.waterGrams) }}</dd></div>
            </template>
            <template v-if="result.preferments.poolish.flourGrams">
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Poolish flour</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.poolish.flourGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Poolish water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.poolish.waterGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Poolish yeast</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatYeastMass(result.preferments.poolish.yeastGrams, true) }}</dd></div>
            </template>
            <template v-if="result.preferments.biga.flourGrams">
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Biga flour</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.biga.flourGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Biga water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.biga.waterGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-[#f0ece4] py-[11px]"><dt class="text-[12px] text-[#645d54]">Biga yeast</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatYeastMass(result.preferments.biga.yeastGrams, true) }}</dd></div>
            </template>
          </dl>
        </template>

        <ul v-if="result.warnings.length" class="mb-0 mt-[17px] grid list-none gap-[8px] p-0" aria-label="Recipe warnings">
          <li
            v-for="warning in result.warnings"
            :key="warning"
            class="rounded-r-[7px] border-l-[3px] border-[#cc8a51] bg-[#fbf1df] px-[11px] py-[9px] text-[11px] leading-[1.45] text-[#76512e]"
          >{{ DOUGH_WARNING_LABELS[warning] }}</li>
        </ul>
      </template>
    </div>
  </section>
</template>
