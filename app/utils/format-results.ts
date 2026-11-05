import type { TemperatureUnit } from '../domain/water-temperature'
import type { DoughRecipeWarning } from '../domain/dough-recipe/types'

function fixed(value: number, digits: number): string {
  return Number(value.toFixed(digits)).toString()
}

export function formatMass(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '–'
  return `${fixed(value, 0)} g`
}

export function formatSaltMass(value: number): string {
  return `${fixed(value, value < 10 ? 1 : 0)} g`
}

function yeastDigitsWithPreferment(value: number): number {
  return value <= 0.1 ? 3 : 2
}

function yeastDigitsWithoutPreferment(value: number): number {
  if (value <= 0.1) return 3
  if (value > 100) return 0
  if (value > 10) return 1
  return 2
}

export function formatYeastMass(value: number, hasYeastPreferment: boolean): string {
  const digits = hasYeastPreferment
    ? yeastDigitsWithPreferment(value)
    : yeastDigitsWithoutPreferment(value)
  return `${fixed(value, digits)} g`
}

export function formatTemperature(value: number, unit: TemperatureUnit): string {
  return `${fixed(value, 1)}°${unit}`
}

export function formatPercent(value: number): string {
  return `${fixed(value, 0)}%`
}

export const DOUGH_WARNING_LABELS: Record<DoughRecipeWarning, string> = {
  'invalid-flour-share-total': 'Flour shares must total 100% to show individual flour quantities.',
  'preferment-allocation-exceeded': 'Preferment flour or water allocations exceed the available recipe amounts.',
  'excessive-leavening': 'The preferment leaves less than 25% of the calculated yeast for the main dough.'
}
