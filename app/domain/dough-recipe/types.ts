export type DoughStyle = 'Neapolitan' | 'Pan Pizza'
export type YeastType = 'LBF' | 'LSI' | 'LSA' | 'LMS' | 'LML'
export type TemperatureUnit = 'C' | 'F'
export type OldDoughStrength = 'low' | 'high'
export type PrefermentType = 'poolish' | 'biga'

export interface DoughRecipeInput {
  style: DoughStyle
  target: {
    firstBallCount: number
    firstBallWeightGrams: number
    secondGroupEnabled: boolean
    secondBallCount: number
    secondBallWeightGrams: number
    wastagePercent: number
    oldDoughOutGrams: number
    oldDoughInEnabled: boolean
    oldDoughInPercent: number
    oldDoughStrength: OldDoughStrength
  }
  ingredients: {
    flourCount: number
    flourShares: number[]
    flourSharesByCount: Record<string, number[]>
    hydrationPercent: number
    saltPercent: number
    fatEnabled: boolean
    fatPercent: number
  }
  fermentation: {
    roomHours: number
    roomTemperature: number
    controlledEnabled: boolean
    controlledHours: number
    controlledTemperature: number
    temperatureUnit: TemperatureUnit
  }
  yeast: {
    type: YeastType
    adjustmentPercent: number
  }
  preferments: {
    autolysisEnabled: boolean
    autolysisFlourPercent: number
    autolysisWaterPercent: number
    poolishEnabled: boolean
    poolishFlourPercent: number
    poolishHours: number
    bigaEnabled: boolean
    bigaFlourPercent: number
  }
}

export type DoughRecipeWarning =
  | 'invalid-flour-share-total'
  | 'preferment-allocation-exceeded'
  | 'excessive-leavening'

export interface DoughRecipeResult {
  targetMassGrams: number
  oldDoughInMassGrams: number
  oldDoughOutMassGrams: number
  newDoughMassGrams: number
  totalFlourGrams: number
  mainDough: {
    flourGrams: number
    waterGrams: number
    saltGrams: number
    fatGrams: number
    yeastGrams: number
  }
  preferments: {
    autolysis: { flourGrams: number; waterGrams: number }
    poolish: { flourGrams: number; waterGrams: number; yeastGrams: number }
    biga: { flourGrams: number; waterGrams: number; yeastGrams: number }
  }
  flourMix: {
    status: 'single' | 'valid' | 'invalid'
    flourGrams: Array<number | null>
  }
  warnings: DoughRecipeWarning[]
}
