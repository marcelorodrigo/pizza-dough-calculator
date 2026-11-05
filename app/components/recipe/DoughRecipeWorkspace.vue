<script setup lang="ts">
import { computed } from 'vue'
import DoughTargetSection from './DoughTargetSection.vue'
import FermentationSection from './FermentationSection.vue'
import FlourMixSection from './FlourMixSection.vue'
import PrefermentsSection from './PrefermentsSection.vue'
import RecipeResultsPanel from './RecipeResultsPanel.vue'
import { calculateDoughRecipe } from '../../domain/dough-recipe/calculateDoughRecipe'
import { createDefaultDoughRecipeInput } from '../../domain/dough-recipe/defaults'
import { isDoughRecipeInput } from '../../domain/dough-recipe/persistence'
import {
  applyDoughStyle,
  normalizeDisabledDoughRecipeFields,
  setFlourCount,
  setTemperatureUnit,
  togglePreferment
} from '../../domain/dough-recipe/transitions'
import { validateDoughRecipeInput } from '../../domain/dough-recipe/validation'
import type { DoughRecipeInput, DoughStyleId, PrefermentType, TemperatureUnit } from '../../domain/dough-recipe/types'
import { usePersistedCalculatorState } from '../../composables/usePersistedCalculatorState'

const recipe = usePersistedCalculatorState(
  'recipe',
  createDefaultDoughRecipeInput,
  isDoughRecipeInput
)

const errors = computed(() => validateDoughRecipeInput(recipe.value))
const result = computed(() => Object.keys(errors.value).length === 0
  ? calculateDoughRecipe(recipe.value)
  : null)
const targetLabel = computed(() => {
  const target = recipe.value.target
  const secondGroup = target.secondGroupEnabled
    ? ` + ${target.secondBallCount} × ${target.secondBallWeightGrams} g`
    : ''
  return `${target.firstBallCount} × ${target.firstBallWeightGrams} g${secondGroup}`
})
const sourdoughDisabled = computed(() =>
  recipe.value.preferments.poolishEnabled || recipe.value.preferments.bigaEnabled
)

function updateTarget(target: DoughRecipeInput['target']) {
  recipe.value = normalizeDisabledDoughRecipeFields({ ...recipe.value, target })
}

function updateIngredients(ingredients: DoughRecipeInput['ingredients']) {
  recipe.value = normalizeDisabledDoughRecipeFields({ ...recipe.value, ingredients })
}

function updateFermentation(fermentation: DoughRecipeInput['fermentation']) {
  recipe.value = normalizeDisabledDoughRecipeFields({ ...recipe.value, fermentation })
}

function updateYeast(yeast: DoughRecipeInput['yeast']) {
  recipe.value = normalizeDisabledDoughRecipeFields({ ...recipe.value, yeast })
}

function updatePreferments(preferments: DoughRecipeInput['preferments']) {
  recipe.value = normalizeDisabledDoughRecipeFields({ ...recipe.value, preferments })
}

function changeStyle(style: DoughStyleId) {
  recipe.value = applyDoughStyle(recipe.value, style)
}

function changeTemperatureUnit(unit: TemperatureUnit) {
  recipe.value = setTemperatureUnit(recipe.value, unit)
}

function changeFlourCount(count: number) {
  recipe.value = setFlourCount(recipe.value, count)
}

function changePreferment(preferment: 'autolysis' | PrefermentType) {
  if (preferment === 'autolysis') {
    recipe.value = normalizeDisabledDoughRecipeFields({
      ...recipe.value,
      preferments: {
        ...recipe.value.preferments,
        autolysisEnabled: !recipe.value.preferments.autolysisEnabled
      }
    })
    return
  }
  recipe.value = togglePreferment(recipe.value, preferment)
}
</script>

<template>
  <div class="grid grid-cols-[minmax(0,1.55fr)_minmax(290px,0.85fr)] items-start gap-[20px] below-960:grid-cols-[minmax(0,1.25fr)_minmax(275px,0.85fr)] below-720:grid-cols-[minmax(0,1fr)] below-720:gap-[15px]">
    <div class="grid gap-[16px]">
      <DoughTargetSection
        :model-value="recipe.target"
        :style="recipe.style"
        :errors="errors"
        @update:model-value="updateTarget"
        @update:style="changeStyle"
      />
      <FlourMixSection
        :model-value="recipe.ingredients"
        :errors="errors"
        @update:model-value="updateIngredients"
        @flour-count-change="changeFlourCount"
      />
      <FermentationSection
        :model-value="recipe.fermentation"
        :yeast="recipe.yeast"
        :sourdough-disabled="sourdoughDisabled"
        :errors="errors"
        @update:model-value="updateFermentation"
        @update:yeast="updateYeast"
        @unit-change="changeTemperatureUnit"
      />
      <PrefermentsSection
        :model-value="recipe.preferments"
        :errors="errors"
        @update:model-value="updatePreferments"
        @toggle-preferment="changePreferment"
      />
    </div>
    <RecipeResultsPanel
      :result="result"
      :errors="errors"
      :target-label="targetLabel"
      :yeast-type="recipe.yeast.type"
    />
  </div>
</template>
