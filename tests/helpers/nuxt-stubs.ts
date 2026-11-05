import { defineComponent, h } from 'vue'

export const NuxtLayoutStub = defineComponent({
  name: 'NuxtLayout',
  setup(_, { slots }) {
    return () => h('div', { class: 'layout-stub' }, slots.default?.())
  }
})

export const NuxtPageStub = defineComponent({
  name: 'NuxtPage',
  setup() {
    return () => h('p', { class: 'page-stub' }, 'Page content')
  }
})

export const NuxtLinkStub = defineComponent({
  name: 'NuxtLink',
  props: {
    to: {
      type: [String, Object],
      required: true
    }
  },
  setup(props, { slots }) {
    return () => h('a', { href: String(props.to) }, slots.default?.())
  }
})
