import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FlourStrengthPage from '../../../app/pages/tools/flour-strength.vue'
import { createDefaultFlourStrengthState } from '../../../app/domain/calculator-inputs'
import { createModelEmittingStub } from '../../helpers/model-stub'

const FlourStrengthCalculatorStub = createModelEmittingStub(
  'FlourStrengthCalculator',
  createDefaultFlourStrengthState
)

describe('FlourStrengthPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('wires persisted flour strength state into the calculator', () => {
    const store = { load: vi.fn(() => null), save: vi.fn() }
    vi.stubGlobal('useNuxtApp', () => ({ $calculatorStateStore: store }))

    const wrapper = mount(FlourStrengthPage, {
      global: {
        stubs: {
          FlourStrengthCalculator: FlourStrengthCalculatorStub,
          CalculatorNavigation: true
        }
      }
    })

    expect(wrapper.get('h1').text()).toBe('Flour strength')
    expect(wrapper.text()).toContain('Blend flours to reach a target W value')
    expect(wrapper.find('.calculator-stub').exists()).toBe(true)
    expect(wrapper.find('calculator-navigation-stub').exists()).toBe(true)
    expect(store.load).toHaveBeenCalledWith('flour-strength')
  })
})
