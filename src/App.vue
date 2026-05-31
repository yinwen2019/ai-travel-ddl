<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ScrollToTop from '@/components/common/ScrollToTop.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'

const error = ref<string | null>(null)

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err.message : String(err)
  return false
})

function dismissError() {
  error.value = null
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white dark:bg-gray-900">
    <AppHeader />

    <!-- 错误边界 -->
    <ErrorBanner
      v-if="error"
      :message="error"
      class="mx-auto mt-4 max-w-6xl px-4"
      @retry="dismissError"
    />

    <!-- 主内容区 -->
    <main
      v-else
      class="flex-1 animate-fade-in"
    >
      <router-view />
    </main>

    <AppFooter />
    <ScrollToTop />
  </div>
</template>
