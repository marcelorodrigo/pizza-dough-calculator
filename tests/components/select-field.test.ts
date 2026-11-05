import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SelectField from '../../app/components/form/SelectField.vue'

const options = [
  { value: 'neapolitan', label: 'Neapolitan' },
  { value: 'pan-pizza', label: 'Pan Pizza' }
]

describe('SelectField', () => {
  it('renders an accessible labelled native select with the provided options', () => {
    const wrapper = mount(SelectField, {
      props: { modelValue: 'neapolitan', label: 'Dough style', options }
    })
    const select = wrapper.get('select')

    expect(wrapper.get('label').text()).toContain('Dough style')
    expect(select.findAll('option').map(option => [option.attributes('value'), option.text()]))
      .toEqual([['neapolitan', 'Neapolitan'], ['pan-pizza', 'Pan Pizza']])
    expect((select.element as HTMLSelectElement).value).toBe('neapolitan')
  })

  it('emits the selected value', async () => {
    const wrapper = mount(SelectField, {
      props: { modelValue: 'neapolitan', label: 'Dough style', options }
    })

    await wrapper.get('select').setValue('pan-pizza')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['pan-pizza'])
  })
})
