import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DoughRecipeWorkspace from '../../app/components/recipe/DoughRecipeWorkspace.vue'
import { createDefaultDoughRecipeInput } from '../../app/domain/dough-recipe/defaults'
import type { CalculatorStateStore } from '../../app/services/calculator-state-store'

afterEach(() => vi.unstubAllGlobals())

function mountWorkspace(saved: unknown = null) {
  const store: CalculatorStateStore = {
    load: vi.fn(() => saved),
    save: vi.fn()
  }
  vi.stubGlobal('useNuxtApp', () => ({ $calculatorStateStore: store }))
  const wrapper = mount(DoughRecipeWorkspace)
  return { wrapper, store }
}

function numberField(wrapper: VueWrapper, label: string) {
  const field = wrapper.findAll('label.number-field')
    .find(candidate => candidate.text().includes(label))
  if (!field) throw new Error(`Missing number field: ${label}`)
  return field.get('input')
}

async function setNumber(wrapper: VueWrapper, label: string, value: number | string) {
  await numberField(wrapper, label).setValue(String(value))
  await nextTick()
}

function checkbox(wrapper: VueWrapper, label: string) {
  const control = wrapper.findAll('label.check-control')
    .find(candidate => candidate.text().includes(label))
  if (!control) throw new Error(`Missing checkbox: ${label}`)
  return control.get('input')
}

async function setCheckbox(wrapper: VueWrapper, label: string, value: boolean) {
  await checkbox(wrapper, label).setValue(value)
  await nextTick()
}

function select(wrapper: VueWrapper, label: string) {
  const control = wrapper.findAll('label.select-field')
    .find(candidate => candidate.text().includes(label))
  if (!control) throw new Error(`Missing select: ${label}`)
  return control.get('select')
}

async function setSelect(wrapper: VueWrapper, label: string, value: string) {
  await select(wrapper, label).setValue(value)
  await nextTick()
}

describe('DoughRecipeWorkspace', () => {
  it('normalizes invalid disabled temperatures in the active unit without hiding active errors', async () => {
    const { wrapper, store } = mountWorkspace()
    await nextTick()

    await setSelect(wrapper, 'Temperature unit', 'F')

    const controlledToggle = () => wrapper.findAll('label.check-control')
      .find(label => label.text().includes('Add controlled-temperature fermentation'))!
      .get('input')
    await controlledToggle().setValue(true)

    await numberField(wrapper, 'Controlled temperature').setValue('')
    expect(wrapper.text()).toContain('Controlled temperature is required.')
    expect((numberField(wrapper, 'Controlled temperature').element as HTMLInputElement).value).toBe('')

    await controlledToggle().setValue(false)
    await setNumber(wrapper, 'Room fermentation time', 9)

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
    const { wrapper } = mountWorkspace()
    await nextTick()

    const options = select(wrapper, 'Dough style').findAll('option')

    expect(options.map(option => option.attributes('value'))).toEqual(['neapolitan', 'pan-pizza'])
    expect(options.map(option => option.text())).toEqual(['Neapolitan', 'Pan Pizza'])
    expect((select(wrapper, 'Dough style').element as HTMLSelectElement).value).toBe('neapolitan')

    wrapper.unmount()
  })

  it('writes target, second-group and old-dough edits through normalization', async () => {
    const { wrapper, store } = mountWorkspace()
    await nextTick()

    await setNumber(wrapper, 'Wastage', 2)
    await setNumber(wrapper, 'Ball count', 2)
    await setNumber(wrapper, 'Ball weight', 300)
    await setCheckbox(wrapper, 'Add a second ball size', true)
    await setNumber(wrapper, 'Second ball count', 3)
    await setNumber(wrapper, 'Second ball weight', 500)
    await setNumber(wrapper, 'Old dough out', 100)
    await setCheckbox(wrapper, 'Include old dough in', true)
    await setNumber(wrapper, 'Old dough in', 10)
    await setSelect(wrapper, 'Old dough strength', 'high')

    expect(store.save).toHaveBeenLastCalledWith('recipe', expect.objectContaining({
      target: expect.objectContaining({
        wastagePercent: 2,
        firstBallCount: 2,
        firstBallWeightGrams: 300,
        secondGroupEnabled: true,
        secondBallCount: 3,
        secondBallWeightGrams: 500,
        oldDoughOutGrams: 100,
        oldDoughInEnabled: true,
        oldDoughInPercent: 10,
        oldDoughStrength: 'high'
      })
    }))
    expect(wrapper.get('.target-detail').text()).toBe('2 × 300 g + 3 × 500 g')

    wrapper.unmount()
  })

  it('applies the pan-pizza style defaults', async () => {
    const { wrapper, store } = mountWorkspace()
    await nextTick()

    await setSelect(wrapper, 'Dough style', 'pan-pizza')

    expect(store.save).toHaveBeenLastCalledWith('recipe', expect.objectContaining({
      style: 'pan-pizza',
      target: expect.objectContaining({
        firstBallWeightGrams: 600,
        secondBallWeightGrams: 400
      }),
      ingredients: expect.objectContaining({
        hydrationPercent: 80,
        saltPercent: 2.5,
        fatEnabled: true,
        fatPercent: 2.5
      }),
      fermentation: expect.objectContaining({
        roomHours: 5,
        controlledEnabled: true,
        controlledHours: 43
      })
    }))

    wrapper.unmount()
  })

  it('updates ingredients, fat and flour shares', async () => {
    const { wrapper, store } = mountWorkspace()
    await nextTick()

    await setNumber(wrapper, 'Hydration', 65)
    await setNumber(wrapper, 'Salt', 2.5)
    await setCheckbox(wrapper, 'Add fat to the dough', true)
    await setNumber(wrapper, 'Fat', 3)
    await setSelect(wrapper, 'Number of flours', '2')

    expect(wrapper.findAll('label.number-field').some(field => field.text().includes('Flour 2 share')))
      .toBe(true)

    await setNumber(wrapper, 'Flour 1 share', 70)
    await setNumber(wrapper, 'Flour 2 share', 30)

    expect(store.save).toHaveBeenLastCalledWith('recipe', expect.objectContaining({
      ingredients: expect.objectContaining({
        hydrationPercent: 65,
        saltPercent: 2.5,
        fatEnabled: true,
        fatPercent: 3,
        flourCount: 2,
        flourShares: [70, 30]
      })
    }))

    wrapper.unmount()
  })

  it('updates fermentation, temperature unit and yeast', async () => {
    const { wrapper, store } = mountWorkspace()
    await nextTick()

    await setSelect(wrapper, 'Temperature unit', 'F')
    await setNumber(wrapper, 'Room fermentation time', 10)
    await setNumber(wrapper, 'Room temperature', 70)
    await setCheckbox(wrapper, 'Add controlled-temperature fermentation', true)
    await setNumber(wrapper, 'Controlled fermentation time', 12)
    await setNumber(wrapper, 'Controlled temperature', 40)
    await wrapper.get('input[type="radio"][value="LMS"]').setValue(true)
    await nextTick()
    await setNumber(wrapper, 'Yeast adjustment', 10)

    expect(store.save).toHaveBeenLastCalledWith('recipe', expect.objectContaining({
      fermentation: expect.objectContaining({
        temperatureUnit: 'F',
        roomHours: 10,
        roomTemperature: 70,
        controlledEnabled: true,
        controlledHours: 12,
        controlledTemperature: 40
      }),
      yeast: { type: 'LMS', adjustmentPercent: 10 }
    }))

    wrapper.unmount()
  })

  it('updates preferments and keeps poolish and biga mutually exclusive', async () => {
    const { wrapper, store } = mountWorkspace()
    await nextTick()

    await setCheckbox(wrapper, 'Autolysis', true)
    await setNumber(wrapper, 'Autolysis flour', 55)
    await setNumber(wrapper, 'Autolysis water', 60)
    await setCheckbox(wrapper, 'Poolish', true)
    await setNumber(wrapper, 'Poolish flour', 35)
    await setNumber(wrapper, 'Poolish fermentation time', 6)

    expect(wrapper.get('input[type="radio"][value="LMS"]').attributes('disabled')).toBeDefined()

    await setCheckbox(wrapper, 'Biga', true)
    await setNumber(wrapper, 'Biga flour', 25)

    expect(store.save).toHaveBeenLastCalledWith('recipe', expect.objectContaining({
      preferments: expect.objectContaining({
        autolysisEnabled: true,
        autolysisFlourPercent: 55,
        autolysisWaterPercent: 60,
        poolishEnabled: false,
        poolishFlourPercent: 35,
        poolishHours: 6,
        bigaEnabled: true,
        bigaFlourPercent: 25
      })
    }))

    wrapper.unmount()
  })

  it('restores a valid saved recipe and ignores invalid saved data', async () => {
    const saved = createDefaultDoughRecipeInput()
    saved.target.firstBallCount = 3
    saved.target.firstBallWeightGrams = 300
    const restored = mountWorkspace(saved)
    await nextTick()

    expect(restored.wrapper.get('.target-detail').text()).toBe('3 × 300 g')
    restored.wrapper.unmount()

    const invalid = mountWorkspace({ not: 'a recipe' })
    await nextTick()

    expect(invalid.wrapper.get('.target-detail').text()).toBe('1 × 250 g')
    invalid.wrapper.unmount()
  })
})
