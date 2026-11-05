import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CheckboxField from '../../app/components/form/CheckboxField.vue'

describe('CheckboxField', () => {
  it('renders a labelled native checkbox reflecting the model value', () => {
    const wrapper = mount(CheckboxField, {
      props: { modelValue: true, label: 'Add fat to the dough' }
    })
    const input = wrapper.get('input')

    expect(wrapper.get('label').text()).toContain('Add fat to the dough')
    expect(input.attributes('type')).toBe('checkbox')
    expect((input.element as HTMLInputElement).checked).toBe(true)
  })

  it('emits boolean changes when toggled', async () => {
    const wrapper = mount(CheckboxField, {
      props: { modelValue: false, label: 'Add fat to the dough' }
    })

    await wrapper.get('input').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
  })

  it('forwards an accessible name to the input and honours disabled', () => {
    const wrapper = mount(CheckboxField, {
      props: { modelValue: false, label: 'Autolysis', ariaLabel: 'Autolysis', disabled: true }
    })
    const input = wrapper.get('input')

    expect(input.attributes('aria-label')).toBe('Autolysis')
    expect(input.attributes('disabled')).toBeDefined()
  })
})
