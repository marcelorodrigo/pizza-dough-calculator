import type {
  DoughRecipeInput,
  DoughRecipeResult,
  DoughRecipeWarning,
  YeastType
} from './types'

const YEAST_EXPONENT = 1.4496535328056595

function nutrientNumber(temperatureCelsius: number): number {
  return 2.52766 * Math.exp(-0.12816 * temperatureCelsius)
}

function roomFermentationRate(temperatureCelsius: number, hours: number): number {
  return (nutrientNumber(temperatureCelsius) / hours) ** YEAST_EXPONENT
}

function toCelsius(value: number, unit: 'C' | 'F'): number {
  return unit === 'C' ? value : (value - 32) * 5 / 9
}

function calculateYeastRate(input: DoughRecipeInput, oldDoughInPercent: number): number {
  const roomTemperature = toCelsius(
    input.fermentation.roomTemperature,
    input.fermentation.temperatureUnit
  )
  const controlledTemperature = toCelsius(
    input.fermentation.controlledTemperature,
    input.fermentation.temperatureUnit
  )
  const roomHours = input.fermentation.roomHours
  const controlledHours = input.fermentation.controlledEnabled
    ? input.fermentation.controlledHours
    : 0
  const oldDoughCorrection = oldDoughInPercent * (
    input.target.oldDoughStrength === 'high' ? 0.0058 : 0.0029
  )
  const roomRate = roomFermentationRate(roomTemperature, roomHours)
  const controlledEnabled = controlledHours > 0

  if (input.yeast.type === 'LBF') {
    if (!controlledEnabled) return 100 * roomRate - oldDoughCorrection
    const k = nutrientNumber(controlledTemperature) * roomRate ** -0.68982
    return 100 * (nutrientNumber(controlledTemperature) / (controlledHours + k)) ** YEAST_EXPONENT
      - oldDoughCorrection
  }

  if (input.yeast.type === 'LSI' || input.yeast.type === 'LSA') {
    const divisor = (temperature: number) =>
      (input.yeast.type === 'LSI' ? 0.0643 : 0.042) * temperature + 1
    if (!controlledEnabled) return (100 * roomRate - oldDoughCorrection) / divisor(roomTemperature)

    if (roomTemperature >= controlledTemperature) {
      const k = nutrientNumber(controlledTemperature) * roomRate ** -0.68982
      return (
        100 * (nutrientNumber(controlledTemperature) / (controlledHours + k)) ** YEAST_EXPONENT
        - oldDoughCorrection
      ) / divisor(roomTemperature)
    }

    const controlledRate = roomFermentationRate(controlledTemperature, controlledHours)
    const kc = nutrientNumber(controlledTemperature) * controlledRate ** -0.68982
    return 100 * (nutrientNumber(roomTemperature) / (roomHours + kc)) ** YEAST_EXPONENT
      / divisor(controlledTemperature)
  }

  const a = -0.00159331210952735 * roomTemperature ** 4
    + 0.163153907011014 * roomTemperature ** 3
    - 6.5110885867497101 * roomTemperature ** 2
    + 120.9209432050130033 * roomTemperature
    - 902.4593301366560354
  const b = -0.000343046132670815 * roomTemperature ** 4
    + 0.0352173329513804 * roomTemperature ** 3
    - 1.41145182345809994 * roomTemperature ** 2
    + 26.35584499441489825 * roomTemperature
    - 197.8869720834400141
  const q = Math.exp((roomHours + a) / b)
  const sourdoughFactor = input.yeast.type === 'LML' ? 0.75 : 1
  return controlledEnabled
    ? sourdoughFactor * q * Math.exp(controlledHours / (
      -0.000343046132670815 * controlledTemperature ** 4
      + 0.0352173329513804 * controlledTemperature ** 3
      - 1.41145182345809994 * controlledTemperature ** 2
      + 26.35584499441489825 * controlledTemperature
      - 197.8869720834400141
    ))
    : sourdoughFactor * q
}

function prefermentYeastFactor(type: YeastType): number {
  if (type === 'LSA') return 0.54
  if (type === 'LSI') return 0.45
  return 1
}

interface TargetMasses {
  targetMassGrams: number
  oldDoughInPercent: number
  oldDoughInMassGrams: number
  newDoughMassGrams: number
}

function calculateTargetMasses(target: DoughRecipeInput['target']): TargetMasses {
  const secondGroupMass = target.secondGroupEnabled
    ? target.secondBallCount * target.secondBallWeightGrams
    : 0
  const requestedBallMass = target.firstBallCount * target.firstBallWeightGrams
    + secondGroupMass
    + target.oldDoughOutGrams
  const targetMassGrams = requestedBallMass * (1 + target.wastagePercent / 100)
  const oldDoughInPercent = target.oldDoughInEnabled ? target.oldDoughInPercent : 0
  const oldDoughInMassGrams = targetMassGrams * oldDoughInPercent / 100

  return {
    targetMassGrams,
    oldDoughInPercent,
    oldDoughInMassGrams,
    newDoughMassGrams: targetMassGrams - oldDoughInMassGrams
  }
}

interface IngredientPercents {
  hydrationPercent: number
  saltPercent: number
  fatPercent: number
}

function resolveIngredientPercents(
  ingredients: DoughRecipeInput['ingredients']
): IngredientPercents {
  return {
    hydrationPercent: ingredients.hydrationPercent,
    saltPercent: ingredients.saltPercent,
    fatPercent: ingredients.fatEnabled ? ingredients.fatPercent : 0
  }
}

interface FlourAndYeastMasses {
  yeastGrams: number
  totalFlourGrams: number
  sourdoughFlourGrams: number
  sourdoughWaterGrams: number
}

interface SourdoughSplit {
  flourGrams: number
  waterGrams: number
}

function calculateSourdoughSplit(
  yeastType: YeastType,
  yeastGrams: number
): SourdoughSplit | null {
  if (yeastType === 'LMS') {
    return { flourGrams: yeastGrams * 2 / 3, waterGrams: yeastGrams / 3 }
  }
  if (yeastType === 'LML') {
    return { flourGrams: yeastGrams / 2, waterGrams: yeastGrams / 2 }
  }
  return null
}

function calculateTegliaYeastGrams(
  adjustmentFactor: number,
  totalFlourGrams: number,
  hydrationPercent: number,
  yeastRate: number
): number {
  return adjustmentFactor * 2.2 * 1.8 * totalFlourGrams ** -0.1
    * ((totalFlourGrams * hydrationPercent / 100) * yeastRate / 100)
}

function calculateFlourAndYeastMasses(
  input: DoughRecipeInput,
  newDoughMassGrams: number,
  yeastRate: number,
  percents: IngredientPercents,
  hasYeastPreferment: boolean
): FlourAndYeastMasses {
  const { hydrationPercent, saltPercent, fatPercent } = percents
  const initialFlourGrams = newDoughMassGrams
    / (1 + (hydrationPercent + saltPercent + fatPercent + yeastRate) / 100)

  const adjustmentFactor = 1 + input.yeast.adjustmentPercent / 100
  const styleFactor = input.style === 'Verace' ? 0.9 : 2.2
  const estimatedYeastGrams = adjustmentFactor * styleFactor * 1.8 * initialFlourGrams ** -0.1
    * (initialFlourGrams * yeastRate / 100)
  const yeastGrams = hasYeastPreferment ? estimatedYeastGrams / 2 : estimatedYeastGrams

  const yeastPercent = 100 * yeastGrams / initialFlourGrams
  const resolvedFlourGrams = newDoughMassGrams
    / (1 + (hydrationPercent + saltPercent + fatPercent + yeastPercent) / 100)
  const finalYeastGrams = input.style === 'Teglia'
    ? calculateTegliaYeastGrams(adjustmentFactor, resolvedFlourGrams, hydrationPercent, yeastRate)
    : yeastGrams

  const sourdough = calculateSourdoughSplit(input.yeast.type, finalYeastGrams)
  let totalFlourGrams = resolvedFlourGrams
  let sourdoughFlourGrams = 0
  let sourdoughWaterGrams = 0
  if (sourdough !== null) {
    sourdoughFlourGrams = sourdough.flourGrams
    sourdoughWaterGrams = sourdough.waterGrams
    totalFlourGrams = newDoughMassGrams
      / (1 + (hydrationPercent + saltPercent + fatPercent) / 100)
      - sourdoughFlourGrams
  }

  return {
    yeastGrams: finalYeastGrams,
    totalFlourGrams,
    sourdoughFlourGrams,
    sourdoughWaterGrams
  }
}

function calculatePrefermentMasses(
  preferments: DoughRecipeInput['preferments'],
  totalFlourGrams: number,
  yeastType: YeastType
): DoughRecipeResult['preferments'] {
  const autolysisFlourGrams = preferments.autolysisEnabled
    ? totalFlourGrams * preferments.autolysisFlourPercent / 100
    : 0
  const autolysisWaterGrams = preferments.autolysisEnabled
    ? autolysisFlourGrams * preferments.autolysisWaterPercent / 100
    : 0
  const poolishFlourGrams = preferments.poolishEnabled
    ? totalFlourGrams * preferments.poolishFlourPercent / 100
    : 0
  const poolishYeastGrams = preferments.poolishEnabled
    ? poolishFlourGrams * 3.9 * Math.exp(-0.23 * preferments.poolishHours) / 100
      * prefermentYeastFactor(yeastType)
    : 0
  const bigaFlourGrams = preferments.bigaEnabled
    ? totalFlourGrams * preferments.bigaFlourPercent / 100
    : 0
  const bigaYeastGrams = preferments.bigaEnabled
    ? bigaFlourGrams / 100 * prefermentYeastFactor(yeastType)
    : 0

  return {
    autolysis: { flourGrams: autolysisFlourGrams, waterGrams: autolysisWaterGrams },
    poolish: {
      flourGrams: poolishFlourGrams,
      waterGrams: poolishFlourGrams,
      yeastGrams: poolishYeastGrams
    },
    biga: {
      flourGrams: bigaFlourGrams,
      waterGrams: bigaFlourGrams * 0.45,
      yeastGrams: bigaYeastGrams
    }
  }
}

interface DoughAllocation {
  mainDough: DoughRecipeResult['mainDough']
  yeastAfterAllocationGrams: number
}

function calculateMainDoughAllocation(
  flourAndYeast: FlourAndYeastMasses,
  preferments: DoughRecipeResult['preferments'],
  percents: IngredientPercents
): DoughAllocation {
  const totalFlourWithSourdough = flourAndYeast.totalFlourGrams + flourAndYeast.sourdoughFlourGrams
  const baseWaterGrams = totalFlourWithSourdough * percents.hydrationPercent / 100
    - flourAndYeast.sourdoughWaterGrams
  const saltGrams = totalFlourWithSourdough * percents.saltPercent / 100
  const fatGrams = totalFlourWithSourdough * percents.fatPercent / 100
  const allocatedYeastGrams = preferments.poolish.yeastGrams + preferments.biga.yeastGrams
  const yeastAfterAllocationGrams = flourAndYeast.yeastGrams - allocatedYeastGrams

  return {
    mainDough: {
      flourGrams: flourAndYeast.totalFlourGrams
        - preferments.autolysis.flourGrams
        - preferments.poolish.flourGrams
        - preferments.biga.flourGrams,
      waterGrams: baseWaterGrams
        - preferments.autolysis.waterGrams
        - preferments.poolish.waterGrams
        - preferments.biga.waterGrams,
      saltGrams,
      fatGrams,
      yeastGrams: Math.max(0, yeastAfterAllocationGrams)
    },
    yeastAfterAllocationGrams
  }
}

function calculateFlourMix(
  ingredients: DoughRecipeInput['ingredients'],
  mainDoughFlourGrams: number
): DoughRecipeResult['flourMix'] {
  const activeShares = ingredients.flourShares.slice(0, ingredients.flourCount)
  const shareTotal = activeShares.reduce((total, share) => total + share, 0)

  if (ingredients.flourCount === 1) {
    return { status: 'single', flourGrams: [mainDoughFlourGrams] }
  }
  if (shareTotal === 100) {
    return {
      status: 'valid',
      flourGrams: activeShares.map(share => mainDoughFlourGrams * share / 100)
    }
  }
  return {
    status: 'invalid',
    flourGrams: Array.from({ length: ingredients.flourCount }, () => null)
  }
}

interface WarningContext {
  flourMix: DoughRecipeResult['flourMix']
  preferments: DoughRecipeInput['preferments']
  mainDoughWaterGrams: number
  totalFlourGrams: number
  hasYeastPreferment: boolean
  yeastGrams: number
  yeastAfterAllocationGrams: number
}

function isPrefermentAllocationExceeded(
  preferments: DoughRecipeInput['preferments'],
  mainDoughWaterGrams: number,
  totalFlourGrams: number
): boolean {
  const autolysisAndPoolishExceed = preferments.autolysisEnabled
    && preferments.poolishEnabled
    && preferments.autolysisFlourPercent + preferments.poolishFlourPercent > 100
  const autolysisAndBigaExceed = preferments.autolysisEnabled
    && preferments.bigaEnabled
    && preferments.autolysisFlourPercent + preferments.bigaFlourPercent > 100

  return autolysisAndPoolishExceed
    || autolysisAndBigaExceed
    || mainDoughWaterGrams < 0
    || totalFlourGrams < 0
}

function collectWarnings(context: WarningContext): DoughRecipeWarning[] {
  const warnings: DoughRecipeWarning[] = []

  if (context.flourMix.status === 'invalid') {
    warnings.push('invalid-flour-share-total')
  }
  if (isPrefermentAllocationExceeded(
    context.preferments,
    context.mainDoughWaterGrams,
    context.totalFlourGrams
  )) {
    warnings.push('preferment-allocation-exceeded')
  }
  if (
    context.hasYeastPreferment
    && context.yeastAfterAllocationGrams < 0.25 * context.yeastGrams
  ) {
    warnings.push('excessive-leavening')
  }

  return warnings
}

export function calculateDoughRecipe(input: DoughRecipeInput): DoughRecipeResult {
  const targetMasses = calculateTargetMasses(input.target)
  const percents = resolveIngredientPercents(input.ingredients)
  const hasYeastPreferment = input.preferments.poolishEnabled || input.preferments.bigaEnabled
  const yeastRate = calculateYeastRate(input, targetMasses.oldDoughInPercent)
  const flourAndYeast = calculateFlourAndYeastMasses(
    input,
    targetMasses.newDoughMassGrams,
    yeastRate,
    percents,
    hasYeastPreferment
  )
  const prefermentMasses = calculatePrefermentMasses(
    input.preferments,
    flourAndYeast.totalFlourGrams,
    input.yeast.type
  )
  const allocation = calculateMainDoughAllocation(flourAndYeast, prefermentMasses, percents)
  const flourMix = calculateFlourMix(input.ingredients, allocation.mainDough.flourGrams)
  const warnings = collectWarnings({
    flourMix,
    preferments: input.preferments,
    mainDoughWaterGrams: allocation.mainDough.waterGrams,
    totalFlourGrams: flourAndYeast.totalFlourGrams,
    hasYeastPreferment,
    yeastGrams: flourAndYeast.yeastGrams,
    yeastAfterAllocationGrams: allocation.yeastAfterAllocationGrams
  })

  return {
    targetMassGrams: targetMasses.targetMassGrams,
    oldDoughInMassGrams: targetMasses.oldDoughInMassGrams,
    oldDoughOutMassGrams: input.target.oldDoughOutGrams,
    newDoughMassGrams: targetMasses.newDoughMassGrams,
    totalFlourGrams: flourAndYeast.totalFlourGrams,
    mainDough: allocation.mainDough,
    preferments: prefermentMasses,
    flourMix,
    warnings
  }
}
