import { reactive } from 'vue'
import { describe, expect, it } from 'vitest'
import { createDefaultDoughRecipeInput } from '../../app/domain/dough-recipe/defaults'
import { isDoughRecipeInput } from '../../app/domain/dough-recipe/persistence'
import {
  applyDoughStyle,
  normalizeDisabledDoughRecipeFields,
  setFlourCount,
  setTemperatureUnit,
  togglePreferment
} from '../../app/domain/dough-recipe/transitions'

describe('dough recipe state transitions', () => {
  it('supports reactive inputs and copies nested flour-share arrays independently', () => {
    const input = reactive(createDefaultDoughRecipeInput())
    input.target.firstBallCount = Number.NaN
    const result = setFlourCount(input, 2)

    result.ingredients.flourShares[0] = 55
    result.ingredients.flourSharesByCount['2']![0] = 66

    expect(Number.isNaN(result.target.firstBallCount)).toBe(true)
    expect(input.ingredients.flourCount).toBe(1)
    expect(input.ingredients.flourShares).toEqual([1])
    expect(input.ingredients.flourSharesByCount['2']).toBeUndefined()
    expect(result.ingredients.flourShares).toEqual([55, 1])
    expect(result.ingredients.flourSharesByCount['2']).toEqual([66, 1])
    expect(() => applyDoughStyle(input, 'Teglia')).not.toThrow()
    expect(() => setTemperatureUnit(input, 'F')).not.toThrow()
    expect(() => togglePreferment(input, 'poolish')).not.toThrow()
  })

  it('starts with the documented clean Verace defaults', () => {
    const input = createDefaultDoughRecipeInput()

    expect(input.style).toBe('Verace')
    expect(input.target.firstBallCount).toBe(1)
    expect(input.target.firstBallWeightGrams).toBe(250)
    expect(input.ingredients.hydrationPercent).toBe(60)
    expect(input.yeast.type).toBe('LBF')
    expect(input.fermentation.controlledHours).toBe(0)
    expect(input.fermentation.controlledTemperature).toBe(5)
  })

  it('applies Teglia defaults and disables poolish and biga only', () => {
    const input = createDefaultDoughRecipeInput()
    input.preferments.autolysisEnabled = true
    input.preferments.poolishEnabled = true
    input.preferments.bigaEnabled = true
    input.target.oldDoughInEnabled = true

    const result = applyDoughStyle(input, 'Teglia')

    expect(result.target.firstBallWeightGrams).toBe(600)
    expect(result.target.secondBallWeightGrams).toBe(400)
    expect(result.ingredients.hydrationPercent).toBe(80)
    expect(result.fermentation.controlledHours).toBe(43)
    expect(result.fermentation.controlledEnabled).toBe(true)
    expect(result.ingredients.fatEnabled).toBe(true)
    expect(result.ingredients.fatPercent).toBe(2.5)
    expect(result.preferments).toMatchObject({
      autolysisEnabled: true,
      poolishEnabled: false,
      bigaEnabled: false
    })
    expect(result.target.oldDoughInEnabled).toBe(true)
  })

  it('converts stored fermentation temperatures and rounds to half degrees', () => {
    const input = createDefaultDoughRecipeInput()
    input.fermentation.roomTemperature = 20

    const fahrenheit = setTemperatureUnit(input, 'F')

    expect(fahrenheit.fermentation.roomTemperature).toBe(68)
    expect(fahrenheit.fermentation.temperatureUnit).toBe('F')
    expect(setTemperatureUnit(fahrenheit, 'C').fermentation.roomTemperature).toBe(20)
  })

  it('keeps style defaults at the same physical temperature when Fahrenheit is selected', () => {
    const fahrenheit = setTemperatureUnit(createDefaultDoughRecipeInput(), 'F')

    const result = applyDoughStyle(fahrenheit, 'Teglia')

    expect(result.fermentation.temperatureUnit).toBe('F')
    expect(result.fermentation.roomTemperature).toBe(68)
    expect(result.fermentation.controlledTemperature).toBe(39)
  })

  it('normalizes invalid disabled values in Fahrenheit and after style or preferment transitions', () => {
    const fahrenheitInput = createDefaultDoughRecipeInput()
    fahrenheitInput.fermentation.controlledTemperature = Number.NaN

    const fahrenheit = setTemperatureUnit(fahrenheitInput, 'F')

    expect(fahrenheit.fermentation.controlledTemperature).toBe(41)
    expect(isDoughRecipeInput(fahrenheit)).toBe(true)

    const invalidBiga = createDefaultDoughRecipeInput()
    invalidBiga.preferments.bigaEnabled = true
    invalidBiga.preferments.bigaFlourPercent = Number.NaN

    const teglia = applyDoughStyle(invalidBiga, 'Teglia')

    expect(teglia.preferments.bigaEnabled).toBe(false)
    expect(teglia.preferments.bigaFlourPercent).toBe(30)
    expect(isDoughRecipeInput(teglia)).toBe(true)

    const invalidPoolish = createDefaultDoughRecipeInput()
    invalidPoolish.preferments.poolishEnabled = true
    invalidPoolish.preferments.poolishFlourPercent = Number.NaN

    const withoutPoolish = togglePreferment(invalidPoolish, 'poolish')

    expect(withoutPoolish.preferments.poolishEnabled).toBe(false)
    expect(withoutPoolish.preferments.poolishFlourPercent).toBe(30)
    expect(isDoughRecipeInput(withoutPoolish)).toBe(true)
  })

  it('makes poolish and biga exclusive and replaces sourdough yeast with LBF', () => {
    const input = createDefaultDoughRecipeInput()
    input.yeast.type = 'LMS'

    const withPoolish = togglePreferment(input, 'poolish')
    expect(withPoolish.preferments.poolishEnabled).toBe(true)
    expect(withPoolish.preferments.bigaEnabled).toBe(false)
    expect(withPoolish.yeast.type).toBe('LBF')

    const withBiga = togglePreferment(withPoolish, 'biga')
    expect(withBiga.preferments.bigaEnabled).toBe(true)
    expect(withBiga.preferments.poolishEnabled).toBe(false)
  })

  it('initializes flour shares on first use and restores the exact saved flour count', () => {
    const initial = createDefaultDoughRecipeInput()
    const twoFlours = setFlourCount(initial, 2)
    expect(twoFlours.ingredients.flourShares).toEqual([1, 1])

    twoFlours.ingredients.flourShares = [40, 60]
    const threeFlours = setFlourCount(twoFlours, 3)
    expect(threeFlours.ingredients.flourShares).toEqual([1, 1, 1])
    expect(setFlourCount(threeFlours, 2).ingredients.flourShares).toEqual([40, 60])
  })

  it('keeps invalid flour shares out of the remembered cache', () => {
    const twoFlours = setFlourCount(createDefaultDoughRecipeInput(), 2)
    twoFlours.ingredients.flourShares = [40, 60]
    const threeFlours = setFlourCount(twoFlours, 3)
    threeFlours.ingredients.flourShares = [0, 1, 1]

    const result = setFlourCount(threeFlours, 2)

    expect(result.ingredients.flourSharesByCount['3']).toEqual([1, 1, 1])
    expect(result.ingredients.flourShares).toEqual([40, 60])
    expect(isDoughRecipeInput(result)).toBe(true)
  })
})

describe('normalizeDisabledDoughRecipeFields', () => {
  it('resets invalid values of disabled fields to defaults without mutating the input', () => {
    const input = createDefaultDoughRecipeInput()
    input.target.secondBallCount = Number.NaN
    input.target.secondBallWeightGrams = Number.NaN
    input.target.oldDoughInPercent = Number.NaN
    input.ingredients.flourShares[0] = 0
    input.ingredients.fatPercent = Number.NaN
    input.fermentation.controlledHours = Number.NaN
    input.fermentation.controlledTemperature = Number.NaN
    input.preferments.autolysisFlourPercent = Number.NaN
    input.preferments.autolysisWaterPercent = Number.NaN
    input.preferments.poolishFlourPercent = Number.NaN
    input.preferments.poolishHours = Number.NaN
    input.preferments.bigaFlourPercent = Number.NaN

    const result = normalizeDisabledDoughRecipeFields(input)

    expect(result.target).toMatchObject({
      secondBallCount: 1,
      secondBallWeightGrams: 250,
      oldDoughInPercent: 0
    })
    expect(result.ingredients.flourShares).toEqual([1])
    expect(result.ingredients.fatPercent).toBe(0)
    expect(result.fermentation).toMatchObject({
      controlledHours: 0,
      controlledTemperature: 5
    })
    expect(result.preferments).toEqual({
      autolysisEnabled: false,
      autolysisFlourPercent: 50,
      autolysisWaterPercent: 55,
      poolishEnabled: false,
      poolishFlourPercent: 30,
      poolishHours: 4,
      bigaEnabled: false,
      bigaFlourPercent: 30
    })
    expect(isDoughRecipeInput(result)).toBe(true)
    expect(Number.isNaN(input.target.secondBallCount)).toBe(true)
    expect(input.ingredients.flourShares).toEqual([0])
    expect(Number.isNaN(input.preferments.bigaFlourPercent)).toBe(true)
  })

  it('preserves valid values in disabled fields', () => {
    const input = createDefaultDoughRecipeInput()
    input.target.secondBallCount = 3
    input.target.secondBallWeightGrams = 300
    input.target.oldDoughInPercent = 10
    input.ingredients.flourShares[0] = 70
    input.ingredients.fatPercent = 5
    input.fermentation.controlledHours = 12
    input.fermentation.controlledTemperature = 4
    input.preferments.autolysisFlourPercent = 60
    input.preferments.autolysisWaterPercent = 70
    input.preferments.poolishFlourPercent = 40
    input.preferments.poolishHours = 6
    input.preferments.bigaFlourPercent = 35

    const result = normalizeDisabledDoughRecipeFields(input)

    expect(result).toEqual(input)
  })

  it('does not reset invalid values when their section is enabled', () => {
    const input = createDefaultDoughRecipeInput()
    input.target.secondGroupEnabled = true
    input.target.oldDoughInEnabled = true
    input.ingredients.fatEnabled = true
    input.fermentation.controlledEnabled = true
    input.preferments.autolysisEnabled = true
    input.preferments.poolishEnabled = true
    input.preferments.bigaEnabled = true
    input.target.secondBallCount = Number.NaN
    input.target.secondBallWeightGrams = Number.NaN
    input.target.oldDoughInPercent = Number.NaN
    input.ingredients.fatPercent = Number.NaN
    input.fermentation.controlledHours = Number.NaN
    input.fermentation.controlledTemperature = Number.NaN
    input.preferments.autolysisFlourPercent = Number.NaN
    input.preferments.autolysisWaterPercent = Number.NaN
    input.preferments.poolishFlourPercent = Number.NaN
    input.preferments.poolishHours = Number.NaN
    input.preferments.bigaFlourPercent = Number.NaN

    const result = normalizeDisabledDoughRecipeFields(input)

    expect(Number.isNaN(result.target.secondBallCount)).toBe(true)
    expect(Number.isNaN(result.target.oldDoughInPercent)).toBe(true)
    expect(Number.isNaN(result.ingredients.fatPercent)).toBe(true)
    expect(Number.isNaN(result.fermentation.controlledHours)).toBe(true)
    expect(Number.isNaN(result.preferments.poolishHours)).toBe(true)
    expect(Number.isNaN(result.preferments.bigaFlourPercent)).toBe(true)
    expect(isDoughRecipeInput(result)).toBe(false)
  })

  it('only resets the flour share when a single flour is used', () => {
    const singleFlour = createDefaultDoughRecipeInput()
    singleFlour.ingredients.flourShares[0] = 0

    expect(normalizeDisabledDoughRecipeFields(singleFlour).ingredients.flourShares).toEqual([1])

    const multipleFlours = createDefaultDoughRecipeInput()
    multipleFlours.ingredients.flourCount = 2
    multipleFlours.ingredients.flourShares = [0, 60]

    expect(normalizeDisabledDoughRecipeFields(multipleFlours).ingredients.flourShares).toEqual([0, 60])
  })

  it('converts the default controlled temperature into the current unit', () => {
    const input = createDefaultDoughRecipeInput()
    input.fermentation.temperatureUnit = 'F'
    input.fermentation.roomTemperature = 68
    input.fermentation.controlledTemperature = Number.NaN

    const result = normalizeDisabledDoughRecipeFields(input)

    expect(result.fermentation.controlledTemperature).toBe(41)
    expect(result.fermentation.temperatureUnit).toBe('F')
    expect(isDoughRecipeInput(result)).toBe(true)
  })
})
