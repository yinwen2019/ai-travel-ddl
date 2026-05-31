<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocations } from '@/composables/useLocations'
import { useConferences } from '@/composables/useConferences'
import ClimateCard from './ClimateCard.vue'
import FoodList from './FoodList.vue'
import AttractionList from './AttractionList.vue'

const route = useRoute()
const router = useRouter()
const { getById } = useLocations()
const { conferences } = useConferences()

const location = computed(() => {
  const id = route.params.id as string
  return getById(id)
})

// 曾在此举办的会议（反向关联）
const relatedConferences = computed(() => {
  if (!location.value) return []
  return conferences.value.filter((c) => {
    return c.years.some((y) => y.location_id === location.value!.id)
  })
})

function goToConference(id: string) {
  router.push(`/conference/${id}`)
}
</script>

<template>
  <div v-if="location" class="container-page py-6">
    <!-- 城市标题 -->
    <div class="mb-6">
      <h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
        {{ location.city }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        {{ location.country }} · {{ location.continent }}
      </p>
      <p class="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {{ location.description }}
      </p>
    </div>

    <!-- 信息卡片行 -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700">
        <p class="text-xs text-gray-400">最佳季节</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
          {{ location.best_season }}
        </p>
      </div>
      <div
        v-if="location.language"
        class="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700"
      >
        <p class="text-xs text-gray-400">语言</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
          {{ location.language }}
        </p>
      </div>
      <div
        v-if="location.currency"
        class="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700"
      >
        <p class="text-xs text-gray-400">货币</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
          {{ location.currency }}
        </p>
      </div>
      <div class="rounded-lg border border-gray-200 p-3 text-center dark:border-gray-700">
        <p class="text-xs text-gray-400">所属洲</p>
        <p class="mt-1 text-sm font-medium text-gray-900 dark:text-white">
          {{ location.continent }}
        </p>
      </div>
    </div>

    <!-- 气候图 -->
    <ClimateCard :climate="location.climate" />

    <!-- 美食 -->
    <FoodList :food="location.food" />

    <!-- 景点 -->
    <AttractionList :attractions="location.attractions" />

    <!-- 旅行贴士 -->
    <section
      v-if="location.travel_tips"
      class="mb-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/10"
    >
      <h2 class="mb-1 text-sm font-semibold text-amber-800 dark:text-amber-400">
        旅行贴士
      </h2>
      <p class="text-sm text-amber-700 dark:text-amber-300">
        {{ location.travel_tips }}
      </p>
    </section>

    <!-- 关联会议 -->
    <section v-if="relatedConferences.length > 0" class="mb-6">
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        曾在此举办的会议
      </h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in relatedConferences"
          :key="c.id"
          class="nav-chip"
          @click="goToConference(c.id)"
        >
          {{ c.name }}
        </button>
      </div>
    </section>
  </div>

  <!-- 地点不存在 -->
  <div v-else class="container-page py-20">
    <div class="flex flex-col items-center gap-4">
      <div class="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p class="text-gray-400">地点不存在</p>
      <button class="nav-chip" @click="router.push('/')">
        返回首页
      </button>
    </div>
  </div>
</template>
