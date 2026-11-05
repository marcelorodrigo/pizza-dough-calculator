import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../../app/app.vue'
import { NuxtLayoutStub, NuxtPageStub } from '../helpers/nuxt-stubs'

describe('App', () => {
  it('renders the active page inside the Nuxt layout', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          NuxtLayout: NuxtLayoutStub,
          NuxtPage: NuxtPageStub
        }
      }
    })

    expect(wrapper.get('.layout-stub').exists()).toBe(true)
    expect(wrapper.get('.page-stub').text()).toBe('Page content')
  })
})
