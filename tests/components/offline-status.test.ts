import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import OfflineStatus from '../../app/components/app/OfflineStatus.vue'

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value })
}

describe('OfflineStatus', () => {
  afterEach(() => {
    Reflect.deleteProperty(window.navigator, 'onLine')
    vi.restoreAllMocks()
  })

  it('shows the notice while offline and hides it when connectivity returns', async () => {
    setOnline(false)
    const wrapper = mount(OfflineStatus)
    await nextTick()

    expect(wrapper.get('output').text()).toContain('You’re offline')

    setOnline(true)
    window.dispatchEvent(new Event('online'))
    await nextTick()

    expect(wrapper.find('output').exists()).toBe(false)

    setOnline(false)
    window.dispatchEvent(new Event('offline'))
    await nextTick()

    expect(wrapper.get('output').text()).toContain('You’re offline')
  })

  it('removes its connectivity listeners when unmounted', () => {
    setOnline(true)
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(OfflineStatus)

    wrapper.unmount()

    expect(removeEventListener).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function))
  })
})
