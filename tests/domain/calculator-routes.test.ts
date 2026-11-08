import { describe, expect, it } from 'vitest'
import { calculatorRoutes } from '../../app/utils/calculator-routes'

describe('calculatorRoutes', () => {
  it('defines the four calculator routes in navigation order', () => {
    expect(calculatorRoutes.map(route => route.path)).toEqual([
      '/',
      '/tools/flour-strength',
      '/tools/tin-mass',
      '/tools/water-temperature'
    ])
  })

  it('keeps paths unique and absolute', () => {
    const paths = calculatorRoutes.map(route => route.path)

    expect(new Set(paths).size).toBe(paths.length)
    for (const path of paths) {
      expect(path.startsWith('/')).toBe(true)
    }
  })

  it('provides labels, navigation copy and sequential numbers', () => {
    for (const route of calculatorRoutes) {
      expect(route.label).not.toBe('')
      expect(route.navTitle).not.toBe('')
      expect(route.navDetail).not.toBe('')
    }

    expect(calculatorRoutes.map(route => route.number)).toEqual(['01', '02', '03', '04'])
  })
})
