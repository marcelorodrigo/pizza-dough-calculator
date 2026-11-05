import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RadioGroupField from '../../app/components/form/RadioGroupField.vue'

const options = [
  { value: 'LBF', label: 'Compressed' },
  { value: 'LSI', label: 'Instant dry' },
  { value: 'LMS', label: 'Stiff sourdough', disabled: true }
]

describe('RadioGroupField', () => {
  it('renders a fieldset with one native radio per option', () => {
    const wrapper = mount(RadioGroupField, {
      props: { modelValue: 'LBF', legend: 'Yeast type', name: 'dough-yeast-type', options }
    })

    expect(wrapper.get('legend').text()).toBe('Yeast type')
    expect(wrapper.findAll('input[type="radio"]').map(input => input.attributes('value')))
      .toEqual(['LBF', 'LSI', 'LMS'])
    expect((wrapper.get('input[value="LBF"]').element as HTMLInputElement).checked).toBe(true)
  })

  it('emits the selected option and disables excluded options', async () => {
    const wrapper = mount(RadioGroupField, {
      props: { modelValue: 'LBF', legend: 'Yeast type', name: 'dough-yeast-type', options }
    })

    expect(wrapper.get('input[value="LMS"]').attributes('disabled')).toBeDefined()

    await wrapper.get('input[value="LSI"]').setValue(true)

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['LSI'])
  })
})
