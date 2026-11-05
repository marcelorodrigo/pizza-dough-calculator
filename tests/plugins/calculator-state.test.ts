import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CalculatorStateStore } from '../../app/services/calculator-state-store'

describe('calculator state plugin', () => {
  afterEach(() => {
    window.localStorage.clear()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('provides a store backed by browser local storage', async () => {
    vi.stubGlobal('defineNuxtPlugin', (plugin: () => unknown) => plugin)
    const module = await import('../../app/plugins/calculator-state.client')
    const plugin = module.default as unknown as () => {
      provide: { calculatorStateStore: CalculatorStateStore }
    }

    const store = plugin().provide.calculatorStateStore
    store.save('recipe', { hydration: 65 })

    expect(store.load('recipe')).toEqual({ hydration: 65 })
    expect(window.localStorage.getItem('dough-calculator:recipe')).toContain('"hydration":65')
  })
})
