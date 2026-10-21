<script setup lang="ts">
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BrandMark from '@/components/common/BrandMark.vue'

const route = useRoute()
const navItems = [
  { path: '/', label: 'Home' },
  { path: '/world', label: 'World' },
  { path: '/conference', label: 'Conference' },
  { path: '/year', label: 'Year' },
  { path: '/cities', label: 'City' },
  { path: '/rankings', label: 'Rankings' },
]
</script>

<template>
  <header class="app-header">
    <div class="container-page header-inner">
      <router-link to="/" class="brand-link" aria-label="ConfTrip 首页">
        <BrandMark />
        <span>ConfTrip</span>
      </router-link>
      <nav class="main-nav" aria-label="主导航">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :aria-current="
            route.path === item.path ||
            (item.path === '/cities' && route.name === 'city') ||
            (item.path === '/conference' && route.name === 'conference')
              ? 'page'
              : undefined
          "
          >{{ item.label }}</router-link
        >
      </nav>
      <ThemeToggle class="ml-auto" />
    </div>
  </header>
</template>
