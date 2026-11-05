import { describe, expect, it } from 'vitest'
import { calculateDoughRecipe } from '../../app/domain/dough-recipe/calculateDoughRecipe'
import { createDefaultDoughRecipeInput } from '../../app/domain/dough-recipe/defaults'
import { applyDoughStyle } from '../../app/domain/dough-recipe/transitions'
import { validateDoughRecipeInput } from '../../app/domain/dough-recipe/validation'

describe('calculateDoughRecipe', () => {
  it('calculates the documented default Verace recipe without rounding intermediates', () => {
    const result = calculateDoughRecipe(createDefaultDoughRecipeInput())

    expect(result.targetMassGrams).toBe(250)
    expect(result.totalFlourGrams).toBeCloseTo(152.95317998023302, 10)
    expect(result.mainDough.waterGrams).toBeCloseTo(91.7719079881398, 10)
    expect(result.mainDough.saltGrams).toBeCloseTo(4.58859539940699, 10)
    expect(result.mainDough.yeastGrams).toBeCloseTo(0.6862774549210111, 10)
    expect(result.flourMix).toEqual({ status: 'single', flourGrams: [result.totalFlourGrams] })
  })

  it('composes the target mass from both ball groups, wastage, and old dough out', () => {
    const input = createDefaultDoughRecipeInput()
    input.target.firstBallCount = 2
    input.target.firstBallWeightGrams = 250
    input.target.secondGroupEnabled = true
    input.target.secondBallCount = 1
    input.target.secondBallWeightGrams = 200
    input.target.wastagePercent = 5
    input.target.oldDoughOutGrams = 100
    input.target.oldDoughInEnabled = true
    input.target.oldDoughInPercent = 10

    const result = calculateDoughRecipe(input)

    expect(result.targetMassGrams).toBeCloseTo(840, 10)
    expect(result.oldDoughInMassGrams).toBeCloseTo(84, 10)
    expect(result.newDoughMassGrams).toBeCloseTo(756, 10)
    expect(result.oldDoughOutMassGrams).toBe(100)
  })

  it('splits the main dough flour across a valid multi-flour mix', () => {
    const input = createDefaultDoughRecipeInput()
    input.ingredients.flourCount = 2
    input.ingredients.flourShares = [60, 40]

    const result = calculateDoughRecipe(input)

    expect(result.flourMix.status).toBe('valid')
    expect(result.flourMix.flourGrams[0]!).toBeCloseTo(result.mainDough.flourGrams * 0.6, 10)
    expect(result.flourMix.flourGrams[1]!).toBeCloseTo(result.mainDough.flourGrams * 0.4, 10)
    expect(result.warnings).not.toContain('invalid-flour-share-total')
  })

  it('keeps other results available when an active flour mix does not total 100%', () => {
    const input = createDefaultDoughRecipeInput()
    input.ingredients.flourCount = 2
    input.ingredients.flourShares = [20, 20]

    const result = calculateDoughRecipe(input)

    expect(result.flourMix).toEqual({ status: 'invalid', flourGrams: [null, null] })
    expect(result.warnings).toContain('invalid-flour-share-total')
    expect(result.mainDough.waterGrams).toBeGreaterThan(0)
  })

  it('reports preferment allocation warnings without clamping negative main-dough flour', () => {
    const input = createDefaultDoughRecipeInput()
    input.preferments.autolysisEnabled = true
    input.preferments.autolysisFlourPercent = 80
    input.preferments.poolishEnabled = true
    input.preferments.poolishFlourPercent = 30

    const result = calculateDoughRecipe(input)

    expect(result.warnings).toContain('preferment-allocation-exceeded')
    expect(result.mainDough.flourGrams).toBeLessThan(0)
  })

  it('warns when valid preferment water allocations exceed the recipe water', () => {
    const input = createDefaultDoughRecipeInput()
    input.preferments.autolysisEnabled = true
    input.preferments.autolysisFlourPercent = 20
    input.preferments.autolysisWaterPercent = 100
    input.preferments.poolishEnabled = true
    input.preferments.poolishFlourPercent = 50

    const result = calculateDoughRecipe(input)

    expect(result.mainDough.waterGrams).toBeLessThan(0)
    expect(result.warnings).toContain('preferment-allocation-exceeded')
  })

  it('warns when sourdough flour exceeds the available recipe flour', () => {
    const input = createDefaultDoughRecipeInput()
    input.style = 'Teglia'
    input.target.firstBallWeightGrams = 15
    input.ingredients.hydrationPercent = 100
    input.ingredients.saltPercent = 6
    input.ingredients.fatEnabled = true
    input.ingredients.fatPercent = 10
    input.fermentation.roomTemperature = 40
    input.fermentation.roomHours = 1
    input.yeast.type = 'LMS'
    input.yeast.adjustmentPercent = 50
    input.preferments.autolysisEnabled = true
    input.preferments.autolysisFlourPercent = 100

    expect(validateDoughRecipeInput(input)).toEqual({})

    const result = calculateDoughRecipe(input)

    expect(result.totalFlourGrams).toBeCloseTo(-0.521, 3)
    expect(result.preferments.autolysis.flourGrams).toBeLessThan(0)
    expect(result.mainDough.flourGrams).toBeCloseTo(0, 10)
    expect(result.mainDough.waterGrams).toBeGreaterThan(0)
    expect(result.warnings).toContain('preferment-allocation-exceeded')
  })

  it('calculates autolysis flour and water as documented proportions of recipe flour', () => {
    const input = createDefaultDoughRecipeInput()
    input.preferments.autolysisEnabled = true

    const result = calculateDoughRecipe(input)

    expect(result.preferments.autolysis.flourGrams).toBeCloseTo(76.47658999011651, 10)
    expect(result.preferments.autolysis.waterGrams).toBeCloseTo(42.06212449456408, 10)
  })

  it('uses the controlled-fermentation branch for compressed yeast', () => {
    const input = createDefaultDoughRecipeInput()
    input.fermentation.controlledEnabled = true
    input.fermentation.controlledHours = 43
    input.fermentation.controlledTemperature = 4

    const result = calculateDoughRecipe(input)

    expect(result.totalFlourGrams).toBeCloseTo(153.1774582466045, 10)
    expect(result.mainDough.yeastGrams).toBeCloseTo(0.32073443837949195, 10)
  })

  it('uses the Teglia water-mass yeast expression after resolving flour', () => {
    const input = applyDoughStyle(createDefaultDoughRecipeInput(), 'Teglia')

    const result = calculateDoughRecipe(input)

    expect(result.targetMassGrams).toBe(600)
    expect(result.totalFlourGrams).toBeCloseTo(323.1313469491747, 10)
    expect(result.mainDough.yeastGrams).toBeCloseTo(1.7659640317798704, 10)
    expect(result.mainDough.fatGrams).toBeCloseTo(8.078283673729368, 10)
  })

  it.each([
    {
      yeast: 'LSI' as const,
      roomTemperature: 20,
      controlledTemperature: 4,
      controlledHours: 0,
      expectedFlour: 137.89027647263958,
      expectedYeast: 0.23884674540806358
    },
    {
      yeast: 'LSA' as const,
      roomTemperature: 20,
      controlledTemperature: 4,
      controlledHours: 12,
      expectedFlour: 137.9017974000664,
      expectedYeast: 0.2200680252667491
    },
    {
      yeast: 'LSI' as const,
      roomTemperature: 20,
      controlledTemperature: 4,
      controlledHours: 12,
      expectedFlour: 137.9281197577673,
      expectedYeast: 0.17716335814936054
    },
    {
      yeast: 'LSA' as const,
      roomTemperature: 20,
      controlledTemperature: 4,
      controlledHours: 0,
      expectedFlour: 137.85480017186882,
      expectedYeast: 0.2966717123347195
    },
    {
      yeast: 'LSI' as const,
      roomTemperature: 10,
      controlledTemperature: 15,
      controlledHours: 12,
      expectedFlour: 137.7056576880392,
      expectedYeast: 0.5397648455916286
    },
    {
      yeast: 'LSA' as const,
      roomTemperature: 10,
      controlledTemperature: 15,
      controlledHours: 12,
      expectedFlour: 137.63787700974652,
      expectedYeast: 0.6502415238681779
    }
  ])('matches the $yeast fermentation branch and old-dough correction', fixture => {
    const input = createDefaultDoughRecipeInput()
    input.yeast.type = fixture.yeast
    input.target.oldDoughInEnabled = true
    input.target.oldDoughInPercent = 10
    input.target.oldDoughStrength = 'high'
    input.fermentation.roomTemperature = fixture.roomTemperature
    input.fermentation.controlledEnabled = fixture.controlledHours > 0
    input.fermentation.controlledTemperature = fixture.controlledTemperature
    input.fermentation.controlledHours = fixture.controlledHours

    const result = calculateDoughRecipe(input)

    expect(result.oldDoughInMassGrams).toBe(25)
    expect(result.totalFlourGrams).toBeCloseTo(fixture.expectedFlour, 10)
    expect(result.mainDough.yeastGrams).toBeCloseTo(fixture.expectedYeast, 10)
  })

  it('uses the documented stiff and liquid sourdough flour-water splits', () => {
    const stiffInput = createDefaultDoughRecipeInput()
    stiffInput.yeast.type = 'LMS'
    const stiffResult = calculateDoughRecipe(stiffInput)
    expect(stiffResult.totalFlourGrams).toBeCloseTo(124.08279924392667, 10)
    expect(stiffResult.mainDough.waterGrams).toBeCloseTo(77.37882293484677, 10)
    expect(stiffResult.mainDough.yeastGrams).toBeCloseTo(43.93715082736154, 10)

    const liquidInput = createDefaultDoughRecipeInput()
    liquidInput.yeast.type = 'LML'
    liquidInput.fermentation.controlledEnabled = true
    liquidInput.fermentation.controlledHours = 12
    const liquidResult = calculateDoughRecipe(liquidInput)
    expect(liquidResult.totalFlourGrams).toBeCloseTo(137.98708746428784, 10)
    expect(liquidResult.mainDough.waterGrams).toBeCloseTo(76.63739421275409, 10)
    expect(liquidResult.mainDough.yeastGrams).toBeCloseTo(30.774291329093057, 10)

    const liquidUncontrolledInput = createDefaultDoughRecipeInput()
    liquidUncontrolledInput.yeast.type = 'LML'
    const liquidUncontrolledResult = calculateDoughRecipe(liquidUncontrolledInput)
    expect(liquidUncontrolledResult.mainDough.waterGrams).toBeCloseTo(74.86710496355174, 10)
  })

  it('applies yeast adjustment and subtracts LSI poolish yeast from the halved estimate', () => {
    const adjustedInput = createDefaultDoughRecipeInput()
    adjustedInput.target.oldDoughInEnabled = true
    adjustedInput.target.oldDoughInPercent = 10
    adjustedInput.yeast.adjustmentPercent = 25
    const adjustedResult = calculateDoughRecipe(adjustedInput)
    expect(adjustedResult.newDoughMassGrams).toBe(225)
    expect(adjustedResult.mainDough.yeastGrams).toBeCloseTo(0.7309569476125798, 10)

    const poolishInput = createDefaultDoughRecipeInput()
    poolishInput.yeast.type = 'LSI'
    poolishInput.preferments.poolishEnabled = true
    const poolishResult = calculateDoughRecipe(poolishInput)
    expect(poolishResult.preferments.poolish.flourGrams).toBeCloseTo(45.984586759746165, 10)
    expect(poolishResult.preferments.poolish.waterGrams).toBeCloseTo(45.984586759746165, 10)
    expect(poolishResult.preferments.poolish.yeastGrams).toBeCloseTo(0.3216166215238376, 10)
    expect(poolishResult.mainDough.yeastGrams).toBe(0)
    expect(poolishResult.warnings).toContain('excessive-leavening')

    const bigaInput = createDefaultDoughRecipeInput()
    bigaInput.yeast.type = 'LSA'
    bigaInput.preferments.bigaEnabled = true
    const bigaResult = calculateDoughRecipe(bigaInput)
    expect(bigaResult.preferments.biga.flourGrams).toBeCloseTo(45.977880590422664, 10)
    expect(bigaResult.preferments.biga.waterGrams).toBeCloseTo(20.6900462656902, 10)
    expect(bigaResult.preferments.biga.yeastGrams).toBeCloseTo(0.2482805551882824, 10)
  })
})
