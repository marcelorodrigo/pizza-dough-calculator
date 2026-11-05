import type { DoughRecipeInput, DoughStyleId, PrefermentType, TemperatureUnit } from './types'
import { isValidFlourShare } from './persistence'
import { createDefaultDoughRecipeInput } from './defaults'
import { validateDoughRecipeInput } from './validation'
import type { DoughRecipeFieldErrors } from './validation'

function copyInput(input: DoughRecipeInput): DoughRecipeInput {
  return {
    ...input,
    target: { ...input.target },
    ingredients: {
      ...input.ingredients,
      flourShares: [...input.ingredients.flourShares],
      flourSharesByCount: Object.fromEntries(
        Object.entries(input.ingredients.flourSharesByCount).map(([count, shares]) => [count, [...shares]])
      )
    },
    fermentation: { ...input.fermentation },
    yeast: { ...input.yeast },
    preferments: { ...input.preferments }
  }
}

function roundToHalfDegree(value: number): number {
  return Math.round(value * 2) / 2
}

function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (from === to) return value
  if (from === 'C') return roundToHalfDegree(value * 9 / 5 + 32)
  return roundToHalfDegree((value - 32) * 5 / 9)
}

function normalizeDisabledTargetFields(
  target: DoughRecipeInput['target'],
  defaults: DoughRecipeInput['target'],
  errors: DoughRecipeFieldErrors
): void {
  if (!target.secondGroupEnabled) {
    if (errors['target.secondBallCount']) {
      target.secondBallCount = defaults.secondBallCount
    }
    if (errors['target.secondBallWeightGrams']) {
      target.secondBallWeightGrams = defaults.secondBallWeightGrams
    }
  }
  if (!target.oldDoughInEnabled && errors['target.oldDoughInPercent']) {
    target.oldDoughInPercent = defaults.oldDoughInPercent
  }
}

function normalizeDisabledIngredientFields(
  ingredients: DoughRecipeInput['ingredients'],
  defaults: DoughRecipeInput['ingredients'],
  errors: DoughRecipeFieldErrors
): void {
  if (ingredients.flourCount === 1 && errors['ingredients.flourShares.0']) {
    ingredients.flourShares[0] = defaults.flourShares[0]!
  }
  if (!ingredients.fatEnabled && errors['ingredients.fatPercent']) {
    ingredients.fatPercent = defaults.fatPercent
  }
}

function normalizeDisabledFermentationFields(
  fermentation: DoughRecipeInput['fermentation'],
  defaults: DoughRecipeInput['fermentation'],
  errors: DoughRecipeFieldErrors
): void {
  if (fermentation.controlledEnabled) return

  if (errors['fermentation.controlledHours']) {
    fermentation.controlledHours = defaults.controlledHours
  }
  if (errors['fermentation.controlledTemperature']) {
    fermentation.controlledTemperature = convertTemperature(
      defaults.controlledTemperature,
      defaults.temperatureUnit,
      fermentation.temperatureUnit
    )
  }
}

function normalizeDisabledAutolysisFields(
  preferments: DoughRecipeInput['preferments'],
  defaults: DoughRecipeInput['preferments'],
  errors: DoughRecipeFieldErrors
): void {
  if (preferments.autolysisEnabled) return

  if (errors['preferments.autolysisFlourPercent']) {
    preferments.autolysisFlourPercent = defaults.autolysisFlourPercent
  }
  if (errors['preferments.autolysisWaterPercent']) {
    preferments.autolysisWaterPercent = defaults.autolysisWaterPercent
  }
}

function normalizeDisabledPoolishFields(
  preferments: DoughRecipeInput['preferments'],
  defaults: DoughRecipeInput['preferments'],
  errors: DoughRecipeFieldErrors
): void {
  if (preferments.poolishEnabled) return

  if (errors['preferments.poolishFlourPercent']) {
    preferments.poolishFlourPercent = defaults.poolishFlourPercent
  }
  if (errors['preferments.poolishHours']) {
    preferments.poolishHours = defaults.poolishHours
  }
}

function normalizeDisabledBigaFields(
  preferments: DoughRecipeInput['preferments'],
  defaults: DoughRecipeInput['preferments'],
  errors: DoughRecipeFieldErrors
): void {
  if (preferments.bigaEnabled) return

  if (errors['preferments.bigaFlourPercent']) {
    preferments.bigaFlourPercent = defaults.bigaFlourPercent
  }
}

export function normalizeDisabledDoughRecipeFields(input: DoughRecipeInput): DoughRecipeInput {
  const next = copyInput(input)
  const defaults = createDefaultDoughRecipeInput()
  const errors = validateDoughRecipeInput(next, { includeDisabledFields: true })

  normalizeDisabledTargetFields(next.target, defaults.target, errors)
  normalizeDisabledIngredientFields(next.ingredients, defaults.ingredients, errors)
  normalizeDisabledFermentationFields(next.fermentation, defaults.fermentation, errors)
  normalizeDisabledAutolysisFields(next.preferments, defaults.preferments, errors)
  normalizeDisabledPoolishFields(next.preferments, defaults.preferments, errors)
  normalizeDisabledBigaFields(next.preferments, defaults.preferments, errors)

  return next
}

export function applyDoughStyle(input: DoughRecipeInput, style: DoughStyleId): DoughRecipeInput {
  const next = copyInput(input)
  next.style = style
  next.target.firstBallWeightGrams = style === 'neapolitan' ? 250 : 600
  next.target.secondBallWeightGrams = style === 'neapolitan' ? 200 : 400
  next.ingredients.hydrationPercent = style === 'neapolitan' ? 60 : 80
  next.ingredients.saltPercent = style === 'neapolitan' ? 3 : 2.5
  next.fermentation.roomHours = style === 'neapolitan' ? 8 : 5
  next.fermentation.roomTemperature = convertTemperature(
    20,
    'C',
    next.fermentation.temperatureUnit
  )
  next.fermentation.controlledHours = 43
  next.fermentation.controlledTemperature = convertTemperature(
    4,
    'C',
    next.fermentation.temperatureUnit
  )
  next.fermentation.controlledEnabled = style === 'pan-pizza'
  next.ingredients.fatEnabled = style === 'pan-pizza'
  if (style === 'pan-pizza') next.ingredients.fatPercent = 2.5
  next.preferments.poolishEnabled = false
  next.preferments.bigaEnabled = false
  return normalizeDisabledDoughRecipeFields(next)
}

export function setTemperatureUnit(input: DoughRecipeInput, unit: TemperatureUnit): DoughRecipeInput {
  const next = copyInput(input)
  const currentUnit = next.fermentation.temperatureUnit
  if (currentUnit === unit) return normalizeDisabledDoughRecipeFields(next)

  next.fermentation.roomTemperature = convertTemperature(
    next.fermentation.roomTemperature,
    currentUnit,
    unit
  )
  next.fermentation.controlledTemperature = convertTemperature(
    next.fermentation.controlledTemperature,
    currentUnit,
    unit
  )
  next.fermentation.temperatureUnit = unit
  return normalizeDisabledDoughRecipeFields(next)
}

export function setFlourCount(input: DoughRecipeInput, flourCount: number): DoughRecipeInput {
  const next = copyInput(input)
  const currentCount = String(next.ingredients.flourCount)
  const nextCount = String(flourCount)
  if (next.ingredients.flourShares.every(isValidFlourShare)) {
    next.ingredients.flourSharesByCount[currentCount] = [...next.ingredients.flourShares]
  }
  next.ingredients.flourCount = flourCount
  next.ingredients.flourShares = [
    ...(next.ingredients.flourSharesByCount[nextCount] ?? Array.from({ length: flourCount }, () => 1))
  ]
  next.ingredients.flourSharesByCount[nextCount] = [...next.ingredients.flourShares]
  return normalizeDisabledDoughRecipeFields(next)
}

export function togglePreferment(input: DoughRecipeInput, preferment: PrefermentType): DoughRecipeInput {
  const next = copyInput(input)
  const isEnabling = !next.preferments[`${preferment}Enabled`]
  next.preferments[`${preferment}Enabled`] = isEnabling

  if (isEnabling) {
    const other: PrefermentType = preferment === 'poolish' ? 'biga' : 'poolish'
    next.preferments[`${other}Enabled`] = false
    if (next.yeast.type === 'LMS' || next.yeast.type === 'LML') next.yeast.type = 'LBF'
  }
  return normalizeDisabledDoughRecipeFields(next)
}
