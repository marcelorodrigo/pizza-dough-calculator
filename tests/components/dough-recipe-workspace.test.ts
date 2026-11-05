import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DoughRecipeWorkspace from '../../app/components/recipe/DoughRecipeWorkspace.vue'
import type { CalculatorStateStore } from '../../app/services/calculator-state-store'

afterEach(() => vi.unstubAllGlobals())

describe('DoughRecipeWorkspace', () => {
  it('normalizes invalid disabled temperatures in the active unit without hiding active errors', async () => {
    const store: CalculatorStateStore = {
      load: vi.fn(() => null),
      save: vi.fn()
    }
    vi.stubGlobal('useNuxtApp', () => ({ $calculatorStateStore: store }))
    const wrapper = mount(DoughRecipeWorkspace)
    await nextTick()

    const unitSelect = wrapper.findAll('select')
      .find(select => select.find('option[value="F"]').exists())!
    await unitSelect.setValue('F')

    const controlledToggle = () => wrapper.findAll('label.check-control')
      .find(label => label.text().includes('Add controlled-temperature fermentation'))!
      .get('input')
    await controlledToggle().setValue(true)

    const numberField = (label: string) => wrapper.findAll('label.number-field')
      .find(field => field.text().includes(label))!
      .get('input')
    await numberField('Controlled temperature').setValue('')
    expect(wrapper.text()).toContain('Controlled temperature is required.')
    expect((numberField('Controlled temperature').element as HTMLInputElement).value).toBe('')

    await controlledToggle().setValue(false)
    await numberField('Room fermentation time').setValue('9')
    await nextTick()

    expect(store.save).toHaveBeenLastCalledWith('recipe', expect.objectContaining({
      fermentation: expect.objectContaining({
        controlledEnabled: false,
        controlledTemperature: 41,
        roomHours: 9
      })
    }))
    expect(wrapper.findAll('label.number-field').some(field => field.text().includes('Controlled temperature'))).toBe(false)

    wrapper.unmount()
  })

  it('offers Neapolitan as the default dough style', async () => {
    const store: CalculatorStateStore = {
      load: vi.fn(() => null),
      save: vi.fn()
    }
    vi.stubGlobal('useNuxtApp', () => ({ $calculatorStateStore: store }))
    const wrapper = mount(DoughRecipeWorkspace)
    await nextTick()

    const styleLabel = wrapper.findAll('label.select-field')
      .find(label => label.text().includes('Dough style'))!
    const options = styleLabel.findAll('option')

    expect(options.map(option => option.attributes('value'))).toEqual(['Neapolitan', 'Pan Pizza'])
    expect((styleLabel.get('select').element as HTMLSelectElement).value).toBe('Neapolitan')

    wrapper.unmount()
  })
})
