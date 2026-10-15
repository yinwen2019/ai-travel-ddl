<script setup lang="ts">
import type { FoodListProps } from '@/types/location'
withDefaults(defineProps<FoodListProps>(), { food: () => [] })
</script>

<template>
  <section class="city-content-section" aria-labelledby="city-food-heading">
    <h2 id="city-food-heading">尝尝当地的味道</h2>
    <ul v-if="food.length" class="city-editorial-list city-food-list">
      <li v-for="item in food" :key="item.name">
        <h3>{{ item.name }}</h3>
        <p>{{ item.description || '美食介绍待公布。' }}</p>
      </li>
    </ul>
    <p v-else class="city-section-empty">美食资料待公布。</p>
  </section>
</template>
