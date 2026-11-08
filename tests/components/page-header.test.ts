import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PageHeader from '../../app/components/ui/PageHeader.vue'

const sectionClasses = [
  'mb-[30px]',
  'flex',
  'items-end',
  'justify-between',
  'gap-[24px]',
  'below-720:mb-[22px]',
  'below-720:block'
]

const headingClasses = [
  'm-0',
  'font-serif',
  'text-[clamp(34px,5vw,56px)]',
  'font-semibold',
  'leading-[1.08]',
  'tracking-[-.045em]',
  'below-720:text-[clamp(35px,10vw,47px)]'
]

describe('PageHeader', () => {
  it('renders the intro block with an accessible default heading id', () => {
    const wrapper = mount(PageHeader, {
      props: {
        eyebrow: 'Your next bake, well measured',
        title: 'A better dough starts with a plan.',
        description: 'Build a pizza dough recipe around your target.',
        badge: 'Recipe workspace'
      }
    })

    const section = wrapper.get('section')
    expect(section.classes()).toEqual(sectionClasses)
    expect(section.attributes('aria-labelledby')).toBe('page-title')

    const eyebrow = wrapper.get('.eyebrow')
    expect(eyebrow.text()).toBe('Your next bake, well measured')
    expect(eyebrow.classes()).toContain('text-clay-eyebrow')

    const heading = wrapper.get('#page-title')
    expect(heading.element.tagName).toBe('H1')
    expect(heading.text()).toBe('A better dough starts with a plan.')
    expect(heading.classes()).toEqual(headingClasses)

    expect(wrapper.get('p.mt-\\[12px\\]').text()).toBe(
      'Build a pizza dough recipe around your target.'
    )

    const badge = wrapper.get('section > span')
    expect(badge.text()).toBe('Recipe workspace')
    expect(badge.classes()).toContain('rounded-full')
    const dot = badge.get('span')
    expect(dot.classes()).toEqual(['h-[6px]', 'w-[6px]', 'rounded-full', 'bg-olive-bright'])
  })

  it('uses a custom heading id for the section and the heading', () => {
    const wrapper = mount(PageHeader, {
      props: {
        headingId: 'custom-title',
        eyebrow: 'Strength in balance',
        title: 'Flour strength',
        description: 'Blend flours to reach a target W value.',
        badge: 'Baker’s tool'
      }
    })

    expect(wrapper.get('section').attributes('aria-labelledby')).toBe('custom-title')
    expect(wrapper.get('#custom-title').text()).toBe('Flour strength')
    expect(wrapper.find('#page-title').exists()).toBe(false)
  })

  it('renders the title slot instead of the title prop', () => {
    const wrapper = mount(PageHeader, {
      props: {
        eyebrow: 'Your next bake, well measured',
        title: 'A better dough starts with a plan.',
        description: 'Build a pizza dough recipe around your target.',
        badge: 'Recipe workspace'
      },
      slots: {
        title: 'A better dough<br>starts with a plan.'
      }
    })

    const heading = wrapper.get('h1')
    expect(heading.html()).toContain('<br>')
    expect(heading.text()).toBe('A better doughstarts with a plan.')
    expect(heading.text()).not.toContain('A better dough starts with a plan.A better dough')
  })
})
