import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppHeader from '../../app/components/app/AppHeader.vue'
import { NuxtLinkStub } from '../helpers/nuxt-stubs'

describe('AppHeader', () => {
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
})
