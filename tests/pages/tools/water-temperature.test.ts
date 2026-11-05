import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import WaterTemperaturePage from '../../../app/pages/tools/water-temperature.vue'
import { createDefaultWaterTemperatureState } from '../../../app/domain/calculator-inputs'
import { createModelEmittingStub } from '../../helpers/model-stub'

const WaterTemperatureCalculatorStub = createModelEmittingStub(
  'WaterTemperatureCalculator',
  createDefaultWaterTemperatureState
)

describe('WaterTemperaturePage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('wires persisted water temperature state into the calculator', () => {
    const store = { load: vi.fn(() => null), save: vi.fn() }
    vi.stubGlobal('useNuxtApp', () => ({ $calculatorStateStore: store }))

    const wrapper = mount(WaterTemperaturePage, {
      global: {
        stubs: {
          WaterTemperatureCalculator: WaterTemperatureCalculatorStub,
          CalculatorNavigation: true
        }
      }
    })

    expect(wrapper.get('h1').text()).toBe('Water temperature')
    expect(wrapper.text()).toContain('Account for room temperature and mixer friction')
    expect(wrapper.find('.calculator-stub').exists()).toBe(true)
    expect(wrapper.find('calculator-navigation-stub').exists()).toBe(true)
    expect(store.load).toHaveBeenCalledWith('water-temperature')
  })
})
