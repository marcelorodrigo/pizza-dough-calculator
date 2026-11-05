import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DoughTargetSection from '../../app/components/recipe/DoughTargetSection.vue'
import { createDefaultDoughRecipeInput } from '../../app/domain/dough-recipe/defaults'
import type { DoughRecipeInput } from '../../app/domain/dough-recipe/types'
import type { DoughRecipeFieldErrors } from '../../app/domain/dough-recipe/validation'

type Target = DoughRecipeInput['target']

function mountSection(target: Partial<Target> = {}, errors: DoughRecipeFieldErrors = {}) {
  const input = createDefaultDoughRecipeInput()
  const modelValue: Target = { ...input.target, ...target }
  const wrapper = mount(DoughTargetSection, {
    props: { modelValue, style: input.style, errors }
  })
  return { wrapper, modelValue }
}

function numberInput(wrapper: VueWrapper, label: string) {
  const field = wrapper.findAll('label.number-field')
    .find(candidate => candidate.text().includes(label))
  if (!field) throw new Error(`Missing number field: ${label}`)
  return field.get('input')
}

function checkbox(wrapper: VueWrapper, label: string) {
  const control = wrapper.findAll('label.check-control')
    .find(candidate => candidate.text().includes(label))
  if (!control) throw new Error(`Missing checkbox: ${label}`)
  return control.get('input')
}

function select(wrapper: VueWrapper, label: string) {
  const control = wrapper.findAll('label.select-field')
    .find(candidate => candidate.text().includes(label))
  if (!control) throw new Error(`Missing select: ${label}`)
  return control.get('select')
}

describe('DoughTargetSection', () => {
  it('offers both dough styles and hides the optional groups by default', () => {
    const { wrapper } = mountSection()

    expect(wrapper.get('#target-heading').text()).toBe('Dough target')
    const style = select(wrapper, 'Dough style')
    expect(style.findAll('option').map(option => [option.attributes('value'), option.text()]))
      .toEqual([['neapolitan', 'Neapolitan'], ['pan-pizza', 'Pan Pizza']])
    expect((style.element as HTMLSelectElement).value).toBe('neapolitan')

    const labels = wrapper.findAll('label.number-field').map(field => field.text())
    expect(labels.some(label => label.includes('Second ball count'))).toBe(false)
    expect(labels.some(label => label.includes('Old dough in'))).toBe(false)
  })

  it('emits style changes', async () => {
    const { wrapper } = mountSection()

    await select(wrapper, 'Dough style').setValue('pan-pizza')

    expect(wrapper.emitted('update:style')).toEqual([['pan-pizza']])
  })

  it('emits merged target updates for wastage and the first ball group', async () => {
    const { wrapper, modelValue } = mountSection()

    await numberInput(wrapper, 'Wastage').setValue('2')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, wastagePercent: 2 }
    ])

    await numberInput(wrapper, 'Ball count').setValue('4')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, firstBallCount: 4 }
    ])

    await numberInput(wrapper, 'Ball weight').setValue('300')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, firstBallWeightGrams: 300 }
    ])
  })

  it('toggles and edits the second ball group', async () => {
    const { wrapper, modelValue } = mountSection()

    await checkbox(wrapper, 'Add a second ball size').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, secondGroupEnabled: true }
    ])

    const enabled = mountSection({ secondGroupEnabled: true })
    await numberInput(enabled.wrapper, 'Second ball count').setValue('3')
    expect(enabled.wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...enabled.modelValue, secondBallCount: 3 }
    ])

    await numberInput(enabled.wrapper, 'Second ball weight').setValue('500')
    expect(enabled.wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...enabled.modelValue, secondBallWeightGrams: 500 }
    ])
  })

  it('emits old dough out and the conditional old dough in settings', async () => {
    const { wrapper, modelValue } = mountSection({ oldDoughInEnabled: true })

    await numberInput(wrapper, 'Old dough out').setValue('100')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, oldDoughOutGrams: 100 }
    ])

    await numberInput(wrapper, 'Old dough in').setValue('10')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, oldDoughInPercent: 10 }
    ])

    await select(wrapper, 'Old dough strength').setValue('high')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      { ...modelValue, oldDoughStrength: 'high' }
    ])
  })

  it('surfaces field errors on the matching controls', () => {
    const errors: DoughRecipeFieldErrors = {
      'target.wastagePercent': 'Wastage is out of range.',
      'target.secondBallCount': 'Second ball count is required.'
    }
    const { wrapper } = mountSection({ secondGroupEnabled: true }, errors)

    const wastage = numberInput(wrapper, 'Wastage')
    expect(wastage.attributes('aria-invalid')).toBe('true')
    expect(wastage.attributes('aria-describedby')).toBeDefined()
    expect(wrapper.text()).toContain('Wastage is out of range.')

    expect(numberInput(wrapper, 'Second ball count').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Second ball count is required.')
  })
})
