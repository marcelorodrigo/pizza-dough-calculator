<script setup lang="ts">
import { ref } from 'vue'

const width = ref(30)
</script>

<template>
  <NumberField v-model="width" label="Tin width" unit="cm" :min="1" />
</template>
