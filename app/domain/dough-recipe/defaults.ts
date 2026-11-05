import type { DoughRecipeInput } from './types'

export function createDefaultDoughRecipeInput(): DoughRecipeInput {
  return {
    style: 'Neapolitan',
    target: {
      firstBallCount: 1,
      firstBallWeightGrams: 250,
      secondGroupEnabled: false,
      secondBallCount: 1,
      secondBallWeightGrams: 250,
      wastagePercent: 0,
      oldDoughOutGrams: 0,
      oldDoughInEnabled: false,
      oldDoughInPercent: 0,
      oldDoughStrength: 'low'
    },
    ingredients: {
      flourCount: 1,
      flourShares: [1],
      flourSharesByCount: { '1': [1] },
      hydrationPercent: 60,
      saltPercent: 3,
      fatEnabled: false,
      fatPercent: 0
    },
    fermentation: {
      roomHours: 8,
      roomTemperature: 20,
      controlledEnabled: false,
      controlledHours: 0,
      controlledTemperature: 5,
      temperatureUnit: 'C'
    },
    yeast: {
      type: 'LBF',
      adjustmentPercent: 0
    },
    preferments: {
      autolysisEnabled: false,
      autolysisFlourPercent: 50,
      autolysisWaterPercent: 55,
      poolishEnabled: false,
      poolishFlourPercent: 30,
      poolishHours: 4,
      bigaEnabled: false,
      bigaFlourPercent: 30
    }
  }
}
