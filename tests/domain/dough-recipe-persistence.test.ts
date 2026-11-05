import { describe, expect, it } from 'vitest'
import { createDefaultDoughRecipeInput } from '../../app/domain/dough-recipe/defaults'
import { isDoughRecipeInput } from '../../app/domain/dough-recipe/persistence'

describe('isDoughRecipeInput', () => {
  it('accepts the complete documented input shape', () => {
    expect(isDoughRecipeInput(createDefaultDoughRecipeInput())).toBe(true)
  })

  it.each([
    ['missing toggle', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { delete (value.target as Partial<typeof value.target>).secondGroupEnabled }],
    ['non-finite fermentation value', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.fermentation.controlledTemperature = Number.NaN }],
    ['invalid remembered flour shares', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.ingredients.flourSharesByCount['3'] = [50, Number.POSITIVE_INFINITY, 50] }],
    ['out-of-range remembered flour shares', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.ingredients.flourSharesByCount['3'] = [0, 50, 50] }],
    ['off-step remembered flour shares', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.ingredients.flourSharesByCount['3'] = [1.5, 49.5, 49] }],
    ['invalid yeast code', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { (value.yeast as { type: string }).type = 'wild' }],
    ['display label instead of style id', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { (value as { style: string }).style = 'Pan Pizza' }],
    ['out-of-range active input', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.target.firstBallCount = 0 }],
    ['out-of-range disabled second group', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.target.secondBallWeightGrams = 1505 }],
    ['out-of-range disabled old dough input', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.target.oldDoughInPercent = 21 }],
    ['out-of-range disabled fat input', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.ingredients.fatPercent = 11 }],
    ['out-of-range disabled controlled temperature', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.fermentation.controlledTemperature = 21 }],
    ['out-of-range disabled preferment input', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.preferments.poolishHours = 25 }],
    ['out-of-range single-flour share', (value: ReturnType<typeof createDefaultDoughRecipeInput>) => { value.ingredients.flourShares[0] = 0 }]
  ])('rejects %s', (_case, mutate) => {
    const value = createDefaultDoughRecipeInput()
    mutate(value)
    expect(isDoughRecipeInput(value)).toBe(false)
  })
})
