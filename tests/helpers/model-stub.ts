import { defineComponent, h, onMounted } from 'vue'

export function createModelEmittingStub(name: string, createValue: () => unknown) {
  return defineComponent({
    name,
    props: {
      modelValue: {
        type: Object,
        required: true
      }
    },
    emits: ['update:modelValue'],
    setup(_, { emit }) {
      onMounted(() => emit('update:modelValue', createValue()))
      return () => h('div', { class: 'calculator-stub' })
    }
  })
}
