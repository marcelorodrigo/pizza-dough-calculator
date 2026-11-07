import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberFieldHost from '../fixtures/NumberFieldHost.vue'

describe('auto-imported components in Vitest', () => {
  it('resolves NumberField without an explicit import', () => {
    const wrapper = mount(NumberFieldHost)

    expect(wrapper.get('label.number-field').text()).toContain('Tin width')

    const input = wrapper.get('input[type="number"]')
    expect((input.element as HTMLInputElement).value).toBe('30')
  })
})
