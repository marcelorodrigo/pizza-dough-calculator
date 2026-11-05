import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PrefermentsSection from '../../app/components/recipe/PrefermentsSection.vue'
import { createDefaultDoughRecipeInput } from '../../app/domain/dough-recipe/defaults'
import type { DoughRecipeInput } from '../../app/domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../app/domain/dough-recipe/validation'

type Preferments = DoughRecipeInput['preferments']

function mountSection(preferments: Partial<Preferments> = {}, errors: DoughRecipeFieldErrors = {}) {
  const modelValue: Preferments = { ...createDefaultDoughRecipeInput().preferments, ...preferments }
  const wrapper = mount(PrefermentsSection, { props: { modelValue, errors } })
  return { wrapper, modelValue }
}

function numberInput(wrapper: VueWrapper, label: string) {
  const field = wrapper.findAll('label.number-field')
    .find(candidate => candidate.text().includes(label))
  if (!field) throw new Error(`Missing number field: ${label}`)
  return field.get('input')
}

describe('PrefermentsSection', () => {
  it('exposes only the toggles until a preferment is enabled', () => {
    const { wrapper } = mountSection()

    expect(wrapper.get('#preferments-heading').text()).toBe('Preferments')
    expect(wrapper.find('input[type="number"]').exists()).toBe(false)
    expect(wrapper.findAll('input[type="checkbox"]').map(input => input.attributes('aria-label')))
      .toEqual(['Autolysis', 'Poolish', 'Biga'])
  })

  it('emits the documented toggle events for every preferment', async () => {
    const { wrapper } = mountSection()

    await wrapper.get('input[type="checkbox"][aria-label="Autolysis"]').setValue(true)
    await wrapper.get('input[type="checkbox"][aria-label="Poolish"]').setValue(true)
    await wrapper.get('input[type="checkbox"][aria-label="Biga"]').setValue(true)

    expect(wrapper.emitted('toggle-preferment')).toEqual([
      ['autolysis'],
      ['poolish'],
      ['biga']
    ])
  })

  it('shows and updates the autolysis fields', async () => {
    const { wrapper, modelValue } = mountSection({ autolysisEnabled: true })

    expect(wrapper.findAll('label.number-field')).toHaveLength(2)

    await numberInput(wrapper, 'Autolysis flour').setValue('60')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, autolysisFlourPercent: 60 }
    ])

    await numberInput(wrapper, 'Autolysis water').setValue('70')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, autolysisWaterPercent: 70 }
    ])
  })

  it('shows and updates the poolish fields', async () => {
    const { wrapper, modelValue } = mountSection({ poolishEnabled: true })

    expect(wrapper.findAll('label.number-field')).toHaveLength(2)

    await numberInput(wrapper, 'Poolish flour').setValue('40')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, poolishFlourPercent: 40 }
    ])

    await numberInput(wrapper, 'Poolish fermentation time').setValue('8')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, poolishHours: 8 }
    ])
  })

  it('shows and updates the biga field', async () => {
    const { wrapper, modelValue } = mountSection({ bigaEnabled: true })

    expect(wrapper.findAll('label.number-field')).toHaveLength(1)

    await numberInput(wrapper, 'Biga flour').setValue('35')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, bigaFlourPercent: 35 }
    ])
  })

  it('renders field errors for every preferment group', () => {
    const errors: DoughRecipeFieldErrors = {
      'preferments.autolysisFlourPercent': 'Autolysis flour is required.',
      'preferments.autolysisWaterPercent': 'Autolysis water is required.',
      'preferments.poolishFlourPercent': 'Poolish flour is required.',
      'preferments.poolishHours': 'Poolish time is required.',
      'preferments.bigaFlourPercent': 'Biga flour is required.'
    }
    const { wrapper } = mountSection({
      autolysisEnabled: true,
      poolishEnabled: true,
      bigaEnabled: true
    }, errors)

    for (const message of Object.values(errors)) {
      expect(wrapper.text()).toContain(message)
    }
    expect(numberInput(wrapper, 'Autolysis flour').attributes('aria-invalid')).toBe('true')
    expect(numberInput(wrapper, 'Biga flour').attributes('aria-invalid')).toBe('true')
  })
})
