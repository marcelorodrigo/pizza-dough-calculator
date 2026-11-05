import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PwaUpdatePrompt from '../../app/components/app/PwaUpdatePrompt.vue'

function createWorker(initialState = 'installing') {
  const listeners = new Set<() => void>()
  return {
    state: initialState,
    postMessage: vi.fn(),
    addEventListener: vi.fn((event: string, listener: () => void) => {
      if (event === 'statechange') listeners.add(listener)
    }),
    removeEventListener: vi.fn((event: string, listener: () => void) => {
      if (event === 'statechange') listeners.delete(listener)
    }),
    transitionTo(state: string) {
      this.state = state
      for (const listener of [...listeners]) listener()
    }
  }
}

function createRegistration(options: { waiting?: unknown; installing?: unknown } = {}) {
  const listeners = new Map<string, () => void>()
  return {
    waiting: options.waiting ?? null,
    installing: options.installing ?? null,
    addEventListener: vi.fn((event: string, listener: () => void) => {
      listeners.set(event, listener)
    }),
    removeEventListener: vi.fn((event: string) => {
      listeners.delete(event)
    }),
    fire(event: string) {
      listeners.get(event)?.()
    }
  }
}

function createServiceWorker(registration: unknown, controller: unknown = {}) {
  const listeners = new Map<string, () => void>()
  return {
    controller,
    getRegistration: vi.fn().mockResolvedValue(registration),
    ready: Promise.resolve(registration),
    addEventListener: vi.fn((event: string, listener: () => void) => {
      listeners.set(event, listener)
    }),
    removeEventListener: vi.fn((event: string) => {
      listeners.delete(event)
    }),
    fire(event: string) {
      listeners.get(event)?.()
    }
  }
}

function stubEnvironment(serviceWorker?: unknown) {
  const reload = vi.fn()
  vi.stubGlobal('navigator', serviceWorker === undefined ? {} : { serviceWorker })
  vi.stubGlobal('location', { reload })
  return reload
}

describe('PwaUpdatePrompt', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('activates a waiting worker and reloads when it takes control', async () => {
    const worker = createWorker()
    const registration = createRegistration({ waiting: worker })
    const serviceWorker = createServiceWorker(registration)
    const reload = stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    expect(wrapper.text()).toContain('A fresh batch is ready.')
    await wrapper.get('button').trigger('click')
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })

    serviceWorker.fire('controllerchange')
    expect(reload).toHaveBeenCalledOnce()

    wrapper.unmount()
  })

  it('waits for registration when the initial service worker lookup is empty', async () => {
    const registration = createRegistration({ waiting: createWorker() })
    const serviceWorker = createServiceWorker(undefined)
    serviceWorker.ready = Promise.resolve(registration)
    stubEnvironment(serviceWorker)

    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    expect(wrapper.get('button').text()).toBe('Update app')
    wrapper.unmount()
  })

  it('offers an update when a newly installed worker is waiting for control', async () => {
    const worker = createWorker()
    const registration = createRegistration({ installing: worker })
    const serviceWorker = createServiceWorker(registration)
    stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    registration.fire('updatefound')
    worker.transitionTo('activating')
    expect(wrapper.find('aside').exists()).toBe(false)

    worker.transitionTo('installed')
    await nextTick()
    expect(wrapper.text()).toContain('A fresh batch is ready.')
    expect(worker.removeEventListener).toHaveBeenCalledWith('statechange', expect.any(Function))

    wrapper.unmount()
  })

  it('ignores an updatefound event without an installing worker', async () => {
    const registration = createRegistration()
    const serviceWorker = createServiceWorker(registration)
    stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    registration.fire('updatefound')

    expect(wrapper.find('aside').exists()).toBe(false)
    wrapper.unmount()
  })

  it('does not offer an update before the new worker takes control', async () => {
    const worker = createWorker()
    const registration = createRegistration({ installing: worker })
    const serviceWorker = createServiceWorker(registration, null)
    stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    registration.fire('updatefound')
    worker.transitionTo('installed')
    await nextTick()

    expect(wrapper.find('aside').exists()).toBe(false)
    wrapper.unmount()
  })

  it('stops watching once an installing worker becomes redundant', async () => {
    const worker = createWorker()
    const registration = createRegistration({ installing: worker })
    const serviceWorker = createServiceWorker(registration)
    stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    registration.fire('updatefound')
    worker.transitionTo('redundant')

    expect(wrapper.find('aside').exists()).toBe(false)
    expect(worker.removeEventListener).toHaveBeenCalledWith('statechange', expect.any(Function))
    wrapper.unmount()
  })

  it('does not offer an update for a waiting worker without a controller', async () => {
    const registration = createRegistration({ waiting: createWorker() })
    const serviceWorker = createServiceWorker(registration, null)
    stubEnvironment(serviceWorker)

    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    expect(wrapper.find('aside').exists()).toBe(false)
    wrapper.unmount()
  })

  it('does nothing when service workers are unavailable', async () => {
    stubEnvironment()

    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    expect(wrapper.find('aside').exists()).toBe(false)
    wrapper.unmount()
  })

  it('returns quietly when no registration becomes available', async () => {
    const serviceWorker = createServiceWorker(undefined)
    serviceWorker.ready = Promise.resolve(undefined)
    stubEnvironment(serviceWorker)

    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    expect(serviceWorker.addEventListener).not.toHaveBeenCalled()
    expect(wrapper.find('aside').exists()).toBe(false)
    wrapper.unmount()
  })

  it('cleans up both listeners when unmounted', async () => {
    const registration = createRegistration()
    const serviceWorker = createServiceWorker(registration)
    stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    wrapper.unmount()

    expect(registration.removeEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function))
    expect(serviceWorker.removeEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function))
  })

  it('ignores a registration that resolves after unmount', async () => {
    const registration = createRegistration()
    let resolveLookup: (value: unknown) => void = () => {}
    const lookup = new Promise(resolve => {
      resolveLookup = resolve
    })
    const serviceWorker = createServiceWorker(undefined)
    serviceWorker.getRegistration.mockReturnValue(lookup)
    stubEnvironment(serviceWorker)

    const wrapper = mount(PwaUpdatePrompt)
    wrapper.unmount()
    resolveLookup(registration)
    await flushPromises()

    expect(registration.addEventListener).not.toHaveBeenCalled()
  })

  it('does not reload when no update was requested', async () => {
    const registration = createRegistration({ waiting: createWorker() })
    const serviceWorker = createServiceWorker(registration)
    const reload = stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    serviceWorker.fire('controllerchange')

    expect(reload).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('does nothing when the waiting worker is gone before the update is applied', async () => {
    const worker = createWorker()
    const registration = createRegistration({ waiting: worker })
    const serviceWorker = createServiceWorker(registration)
    stubEnvironment(serviceWorker)
    const wrapper = mount(PwaUpdatePrompt)
    await flushPromises()

    registration.waiting = null
    await wrapper.get('button').trigger('click')

    expect(worker.postMessage).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
