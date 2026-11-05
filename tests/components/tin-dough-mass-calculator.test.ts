import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TinDoughMassCalculator from '../../app/components/tools/TinDoughMassCalculator.vue'
import { createDefaultTinDoughMassState } from '../../app/domain/calculator-inputs'

describe('TinDoughMassCalculator', () => {
  it('shows unavailable output for zero dimensions and calculated masses otherwise', () => {
    const state = createDefaultTinDoughMassState()
    state.rectangular = { side1Cm: 30, side2Cm: 40, adjustmentPercent: 10 }
    state.round = { diameterCm: 30, adjustmentPercent: 0 }
    const wrapper = mount(TinDoughMassCalculator, { props: { modelValue: state } })

    expect(wrapper.get('[aria-label="Rectangular tin dough mass"]').text()).toBe('660 g')
    expect(wrapper.get('[aria-label="Round tin dough mass"]').text()).toBe('353 g')
  })

  it('shows a field error and withholds a result for out-of-range dimensions', () => {
    const state = createDefaultTinDoughMassState()
    state.rectangular.side1Cm = 101
    const wrapper = mount(TinDoughMassCalculator, { props: { modelValue: state } })

    expect(wrapper.get('#rectangular-side-1').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[aria-label="Rectangular tin dough mass"]').text()).toBe('–')
    expect(wrapper.text()).toContain('Enter a value from 0 to 100 in steps of 1.')
  })

  it('emits updated state when rectangular fields change', async () => {
    const state = createDefaultTinDoughMassState()
    const wrapper = mount(TinDoughMassCalculator, { props: { modelValue: state } })

    await wrapper.get('#rectangular-side-1').setValue('31')
    await wrapper.get('#rectangular-side-2').setValue('41')
    await wrapper.get('#rectangular-adjustment').setValue('15')

    const rectangular = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as { rectangular: Record<string, number>, round: Record<string, number> }
    expect(rectangular.rectangular).toEqual({ side1Cm: 31, side2Cm: 41, adjustmentPercent: 15 })
    expect(rectangular.round).toEqual(state.round)
  })

  it('emits updated state when round fields change', async () => {
    const state = createDefaultTinDoughMassState()
    const wrapper = mount(TinDoughMassCalculator, { props: { modelValue: state } })

    await wrapper.get('#round-diameter').setValue('30')
    await wrapper.get('#round-adjustment').setValue('-10')

    const round = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as { rectangular: Record<string, number>, round: Record<string, number> }
    expect(round.round).toEqual({ diameterCm: 30, adjustmentPercent: -10 })
    expect(round.rectangular).toEqual(state.rectangular)
  })

  it('withholds the round result when the round fields are invalid', () => {
    const state = createDefaultTinDoughMassState()
    state.round = { diameterCm: 101, adjustmentPercent: 0 }
    const wrapper = mount(TinDoughMassCalculator, { props: { modelValue: state } })

    expect(wrapper.get('#round-diameter').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[aria-label="Round tin dough mass"]').text()).toBe('–')
  })
})
