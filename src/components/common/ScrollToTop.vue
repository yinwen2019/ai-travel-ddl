<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > window.innerHeight
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <button
    v-show="visible"
    class="fixed right-6 bottom-6 rounded-full bg-success p-3 text-white shadow-lg transition-opacity hover:opacity-80"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>
