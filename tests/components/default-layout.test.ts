import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DefaultLayout from '../../app/layouts/default.vue'
import { NuxtLinkStub } from '../helpers/nuxt-stubs'

describe('DefaultLayout', () => {
  it('renders the shell around the page content', () => {
    const wrapper = mount(DefaultLayout, {
      global: { stubs: { NuxtLink: NuxtLinkStub } },
      slots: {
        default: () => h('p', { id: 'page-content' }, 'Page content')
      }
    })

    expect(wrapper.get('header').exists()).toBe(true)
    expect(wrapper.get('#main-content').text()).toContain('Page content')
    expect(wrapper.get('.site-footer').text()).toContain('Good dough takes time.')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
  })
})
