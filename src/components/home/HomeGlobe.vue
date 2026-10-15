<script setup lang="ts">
import globeMarkup from '@/assets/maps/home-globe.svg?raw'
</script>

<template>
  <!-- 本地静态地理底图，仅作背景；交互探索由世界视图提供。 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="home-globe" aria-hidden="true" v-html="globeMarkup" />
</template>
