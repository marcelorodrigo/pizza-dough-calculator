import type { DoughRecipeInput } from './types'
import { validateDoughRecipeInput } from './validation'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export const isValidFlourShare = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value >= 1 && value <= 99

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

function hasFiniteNumbers(record: Record<string, unknown>, keys: string[]): boolean {
  return keys.every(key => isFiniteNumber(record[key]))
}

function hasValidShareSets(value: unknown): boolean {
  if (!isRecord(value)) return false
  return Object.entries(value).every(([count, shares]) => {
    const parsedCount = Number(count)
    return Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= 6
      && Array.isArray(shares) && shares.length === parsedCount && shares.every(isValidFlourShare)
  })
}

export function isDoughRecipeInput(value: unknown): value is DoughRecipeInput {
  if (!isRecord(value) || !isRecord(value.target) || !isRecord(value.ingredients)
    || !isRecord(value.fermentation) || !isRecord(value.yeast) || !isRecord(value.preferments)) {
    return false
  }
  const target = value.target as Record<string, unknown>
  const ingredients = value.ingredients as Record<string, unknown>
  const fermentation = value.fermentation as Record<string, unknown>
  const yeast = value.yeast as Record<string, unknown>
  const preferments = value.preferments as Record<string, unknown>
  const flourCount = ingredients.flourCount

  const hasValidShape = (value.style === 'Neapolitan' || value.style === 'Pan Pizza')
    && hasFiniteNumbers(target, [
      'firstBallCount', 'firstBallWeightGrams', 'secondBallCount', 'secondBallWeightGrams',
      'wastagePercent', 'oldDoughOutGrams', 'oldDoughInPercent'
    ])
    && ['secondGroupEnabled', 'oldDoughInEnabled'].every(key => isBoolean(target[key]))
    && (target.oldDoughStrength === 'low' || target.oldDoughStrength === 'high')
    && typeof flourCount === 'number'
    && Number.isInteger(flourCount)
    && flourCount >= 1
    && flourCount <= 6
    && Array.isArray(ingredients.flourShares)
    && ingredients.flourShares.length === flourCount
    && ingredients.flourShares.every(isFiniteNumber)
    && hasValidShareSets(ingredients.flourSharesByCount)
    && hasFiniteNumbers(ingredients, ['hydrationPercent', 'saltPercent', 'fatPercent'])
    && isBoolean(ingredients.fatEnabled)
    && hasFiniteNumbers(fermentation, [
      'roomHours', 'roomTemperature', 'controlledHours', 'controlledTemperature'
    ])
    && isBoolean(fermentation.controlledEnabled)
    && (fermentation.temperatureUnit === 'C' || fermentation.temperatureUnit === 'F')
    && ['LBF', 'LSI', 'LSA', 'LMS', 'LML'].includes(String(yeast.type))
    && isFiniteNumber(yeast.adjustmentPercent)
    && ['autolysisEnabled', 'poolishEnabled', 'bigaEnabled'].every(key => isBoolean(preferments[key]))
    && hasFiniteNumbers(preferments, [
      'autolysisFlourPercent', 'autolysisWaterPercent', 'poolishFlourPercent',
      'poolishHours', 'bigaFlourPercent'
    ])

  return hasValidShape
    && Object.keys(validateDoughRecipeInput(
      value as unknown as DoughRecipeInput,
      { includeDisabledFields: true }
    )).length === 0
}
