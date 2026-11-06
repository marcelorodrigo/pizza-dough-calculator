import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ThemePreferenceToggle from '../../app/components/app/ThemePreferenceToggle.vue'

describe('ThemePreferenceToggle', () => {
  it('renders the three theme choices with the current one pressed', () => {
    const wrapper = mount(ThemePreferenceToggle, {
      props: { modelValue: 'system' }
    })

    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Color theme')
    const buttons = wrapper.findAll('button')
    expect(buttons.map(button => button.text())).toEqual(['Light', 'System', 'Dark'])
    expect(buttons.map(button => button.attributes('aria-pressed'))).toEqual([
      'false',
      'true',
      'false'
    ])
    expect(buttons.map(button => button.attributes('title'))).toEqual([
      'Use light theme',
      'Use system theme',
      'Use dark theme'
    ])
  })

  it('emits the selected preference when a choice is clicked', async () => {
    const wrapper = mount(ThemePreferenceToggle, {
      props: { modelValue: 'system' }
    })

    await wrapper.findAll('button')[2]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['dark']])
  })
})
