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
    class="sticky top-[94px] overflow-hidden rounded-[15px] border border-line bg-paper shadow-card below-720:static below-720:row-start-1"
    aria-labelledby="results-heading"
    aria-live="polite"
  >
    <header class="bg-panel px-[22px] pb-[18px] pt-[22px] text-panel-ink below-420:px-[17px]">
      <p class="eyebrow m-0 mb-[9px] font-mono text-[10px] uppercase tracking-[0.13em] text-panel-eyebrow">Your formula</p>
      <h2 id="results-heading" class="m-0 font-serif text-[25px] font-medium">Dough recipe</h2>
      <div class="mt-[17px] flex items-baseline justify-between gap-[15px] border-t border-panel-line pt-[15px]">
        <span class="text-[12px] text-panel-muted">{{ result ? 'Target dough mass' : 'Recipe status' }}</span>
        <strong class="font-mono text-[25px] font-medium">{{ result ? formatMass(result.targetMassGrams) : 'Needs attention' }}</strong>
      </div>
      <p v-if="result" class="target-detail mb-0 mt-[8px] text-[11px] text-panel-muted">{{ targetLabel }}</p>
    </header>

    <div class="px-[22px] pb-[22px] pt-[19px] below-420:px-[17px]">
      <p v-if="!result" class="mb-[16px] mt-0 rounded-[8px] border border-error-border bg-error-surface px-[13px] py-[11px] text-[12px] text-error" role="alert">
        {{ Object.keys(errors).length }} {{ Object.keys(errors).length === 1 ? 'input needs' : 'inputs need' }} attention. Correct the highlighted fields to calculate this recipe.
      </p>
      <template v-else>
        <dl class="m-0 grid gap-0">
          <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[10px] uppercase tracking-[0.09em] text-muted">Total dough</dt><dd class="m-0 font-mono text-[11px] text-clay-dark">{{ formatMass(result.newDoughMassGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[10px] uppercase tracking-[0.09em] text-muted">Total flour</dt><dd class="m-0 font-mono text-[11px] text-clay-dark">{{ formatMass(result.totalFlourGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Main dough flour</dt><dd class="m-0 font-mono text-[14px] text-ink" aria-label="Main dough flour">{{ formatMass(result.mainDough.flourGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.mainDough.waterGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Salt</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatSaltMass(result.mainDough.saltGrams) }}</dd></div>
          <div v-if="result.mainDough.fatGrams > 0" class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Fat</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.mainDough.fatGrams) }}</dd></div>
          <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">{{ yeastType === 'LMS' || yeastType === 'LML' ? 'Sourdough starter' : 'Main dough yeast' }}</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatYeastMass(result.mainDough.yeastGrams, result.preferments.poolish.flourGrams > 0 || result.preferments.biga.flourGrams > 0) }}</dd></div>
          <div v-if="result.oldDoughInMassGrams > 0" class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Old dough in</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.oldDoughInMassGrams) }}</dd></div>
          <div v-if="result.oldDoughOutMassGrams > 0" class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Old dough out</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.oldDoughOutMassGrams) }}</dd></div>
        </dl>

        <template v-if="result.flourMix.status !== 'single'">
          <h3 class="mb-[5px] mt-[19px] flex items-center gap-[8px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted before:h-[1px] before:w-[13px] before:bg-clay-border before:content-['']">Main dough flour mix</h3>
          <dl class="m-0 grid gap-0">
            <div v-for="(amount, index) in result.flourMix.flourGrams" :key="index" class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]">
              <dt class="text-[12px] text-ink-secondary">Flour {{ index + 1 }}</dt><dd class="m-0 font-mono text-[14px] text-ink" :aria-label="`Flour ${index + 1} amount`">{{ formatMass(amount) }}</dd>
            </div>
          </dl>
        </template>

        <template v-if="result.preferments.autolysis.flourGrams || result.preferments.poolish.flourGrams || result.preferments.biga.flourGrams">
          <h3 class="mb-[5px] mt-[19px] flex items-center gap-[8px] font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted before:h-[1px] before:w-[13px] before:bg-clay-border before:content-['']">Prepare separately</h3>
          <dl class="m-0 grid gap-0">
            <template v-if="result.preferments.autolysis.flourGrams">
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Autolysis flour</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.autolysis.flourGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Autolysis water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.autolysis.waterGrams) }}</dd></div>
            </template>
            <template v-if="result.preferments.poolish.flourGrams">
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Poolish flour</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.poolish.flourGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Poolish water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.poolish.waterGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Poolish yeast</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatYeastMass(result.preferments.poolish.yeastGrams, true) }}</dd></div>
            </template>
            <template v-if="result.preferments.biga.flourGrams">
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Biga flour</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.biga.flourGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Biga water</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatMass(result.preferments.biga.waterGrams) }}</dd></div>
              <div class="flex items-baseline justify-between gap-[12px] border-b border-line-subtle py-[11px]"><dt class="text-[12px] text-ink-secondary">Biga yeast</dt><dd class="m-0 font-mono text-[14px] text-ink">{{ formatYeastMass(result.preferments.biga.yeastGrams, true) }}</dd></div>
            </template>
          </dl>
        </template>

        <ul v-if="result.warnings.length" class="mb-0 mt-[17px] grid list-none gap-[8px] p-0" aria-label="Recipe warnings">
          <li
            v-for="warning in result.warnings"
            :key="warning"
            class="rounded-r-[7px] border-l-[3px] border-warning-border bg-warning-surface px-[11px] py-[9px] text-[11px] leading-[1.45] text-warning"
          >{{ DOUGH_WARNING_LABELS[warning] }}</li>
        </ul>
      </template>
    </div>
  </section>
</template>
