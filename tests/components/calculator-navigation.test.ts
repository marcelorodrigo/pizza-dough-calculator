import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CalculatorNavigation from '../../app/components/app/CalculatorNavigation.vue'
import { NuxtLinkStub } from '../helpers/nuxt-stubs'

describe('CalculatorNavigation', () => {
  it('renders every tool with its number, copy and destination', () => {
    const wrapper = mount(CalculatorNavigation, {
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })

    expect(wrapper.get('nav').attributes('aria-label')).toBe('Calculator tools')

    const items = wrapper.findAll('.tool-nav__item')
    expect(items).toHaveLength(4)
    expect(items.map(item => item.attributes('href'))).toEqual([
      '/',
      '/tools/flour-strength',
      '/tools/tin-mass',
      '/tools/water-temperature'
    ])
    expect(items.map(item => item.get('.tool-nav__number').text())).toEqual([
      '01',
      '02',
      '03',
      '04'
    ])
    expect(items[0].text()).toContain('Recipe calculator')
    expect(items[0].text()).toContain('Build your dough')
    expect(items[3].text()).toContain('Water temperature')
    expect(items[3].text()).toContain('Dial in your mix')
  })
})
