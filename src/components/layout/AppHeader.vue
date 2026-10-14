<script setup lang="ts">
import { useRoute } from 'vue-router'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import BrandMark from '@/components/common/BrandMark.vue'

const route = useRoute()
const navItems = [
  { path: '/', label: '会议视图' },
  { path: '/year', label: '年份视图' },
  { path: '/world', label: '世界视图' },
]
</script>

<template>
  <header class="app-header">
    <div class="container-page header-inner">
      <router-link to="/" class="brand-link" aria-label="AI Travel DDL 首页">
        <BrandMark />
        <span>AI Travel DDL</span>
      </router-link>
      <nav class="main-nav" aria-label="主导航">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :aria-current="route.path === item.path ? 'page' : undefined"
          >{{ item.label }}</router-link
        >
      </nav>
      <ThemeToggle class="ml-auto" />
    </div>
  </header>
</template>
