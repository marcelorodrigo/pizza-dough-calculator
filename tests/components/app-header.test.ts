import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppHeader from '../../app/components/app/AppHeader.vue'
import { NuxtLinkStub } from '../helpers/nuxt-stubs'

const store = {
  load: vi.fn(() => null),
  save: vi.fn()
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.stubGlobal('useNuxtApp', () => ({ $calculatorStateStore: store }))
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.classList.remove('dark')
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.remove())
  })

  it('renders the brand and a link for every calculator', () => {
    const wrapper = mount(AppHeader, {
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })

    expect(wrapper.get('.brand').attributes('href')).toBe('/')
    expect(wrapper.get('.brand').attributes('aria-label')).toBe('Dough Notes home')
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Calculators')

    const links = wrapper.findAll('.primary-nav__link')
    expect(links.map(link => link.text())).toEqual([
      'Recipe',
      'Flour strength',
      'Tin mass',
      'Water temp'
    ])
    expect(links.map(link => link.attributes('href'))).toEqual([
      '/',
      '/tools/flour-strength',
      '/tools/tin-mass',
      '/tools/water-temperature'
    ])
  })

  it('offers light, system, and dark theme choices', () => {
    const wrapper = mount(AppHeader, {
      global: { stubs: { NuxtLink: NuxtLinkStub } }
    })

    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Color theme')
    expect(wrapper.findAll('[role="group"] button').map(button => button.text())).toEqual([
      'Light',
      'System',
      'Dark'
    ])
  })
})
