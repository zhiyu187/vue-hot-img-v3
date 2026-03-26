<script setup>
import { ref } from 'vue';
import HotZone from './components/HotZone.vue';
const  a = ref([])
</script>

<template>
  <div style="width: 500px;height: 800px; overflow-y:auto;">
      <hot-zone v-model="a" :image="''" />
  </div>
  
</template>

<style scoped>
</style>
