import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SectionCard from '../../app/components/ui/SectionCard.vue'

describe('SectionCard', () => {
  it('renders the section shell with an accessible heading and step mark', () => {
    const wrapper = mount(SectionCard, {
      props: {
        headingId: 'target-heading',
        eyebrow: 'Start with the bake',
        title: 'Dough target',
        step: '01'
      },
      slots: { default: '<p>Body</p>' }
    })

    const section = wrapper.get('section')
    expect(section.classes()).toContain('form-card')
    expect(section.attributes('aria-labelledby')).toBe('target-heading')
    expect(wrapper.get('#target-heading').text()).toBe('Dough target')
    expect(wrapper.get('.eyebrow').text()).toBe('Start with the bake')
    expect(wrapper.get('.step-mark').text()).toBe('01')
    expect(wrapper.text()).toContain('Body')
  })

  it('supports the tool variant and optional copy', () => {
    const wrapper = mount(SectionCard, {
      props: {
        headingId: 'round-tin-heading',
        eyebrow: 'For a pizza pan',
        title: 'Round tin',
        variant: 'tool',
        copy: 'Use the tin diameter.'
      }
    })

    expect(wrapper.get('section').classes()).toContain('tool-card')
    expect(wrapper.get('.section-copy').text()).toBe('Use the tin diameter.')
    expect(wrapper.find('.step-mark').exists()).toBe(false)
  })
})
