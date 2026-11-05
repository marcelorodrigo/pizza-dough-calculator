import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TinMassPage from '../../../app/pages/tools/tin-mass.vue'
import { createDefaultTinDoughMassState } from '../../../app/domain/calculator-inputs'
import { createModelEmittingStub } from '../../helpers/model-stub'

const TinDoughMassCalculatorStub = createModelEmittingStub(
  'TinDoughMassCalculator',
  createDefaultTinDoughMassState
)

describe('TinMassPage', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('wires persisted tin mass state into the calculator', () => {
    const store = { load: vi.fn(() => null), save: vi.fn() }
    vi.stubGlobal('useNuxtApp', () => ({ $calculatorStateStore: store }))

    const wrapper = mount(TinMassPage, {
      global: {
        stubs: {
          TinDoughMassCalculator: TinDoughMassCalculatorStub,
          CalculatorNavigation: true
        }
      }
    })

    expect(wrapper.get('h1').text()).toBe('Tin dough mass')
    expect(wrapper.text()).toContain('Estimate the dough mass for a rectangular sheet pan')
    expect(wrapper.find('.calculator-stub').exists()).toBe(true)
    expect(wrapper.find('calculator-navigation-stub').exists()).toBe(true)
    expect(store.load).toHaveBeenCalledWith('tin-mass')
  })
})
