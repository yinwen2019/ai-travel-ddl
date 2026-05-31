<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConferences } from '@/composables/useConferences'
import BadgeTag from '@/components/common/BadgeTag.vue'
import ConferenceTimelineItem from './ConferenceTimelineItem.vue'

const route = useRoute()
const router = useRouter()
const { getById, conferences } = useConferences()

const conference = computed(() => {
  const id = route.params.id as string
  return getById(id)
})

// 合并所有年份按年份降序
const allEntries = computed(() => {
  if (!conference.value) return []
  const entries: {
    year: number
    city: string
    country: string
    continent: string
    venue?: string
    location_id?: string
    isUpcoming: boolean
    abstractDDL: string | null
    paperDDL: string | null
    notificationDate: string | null
    cameraReady: string | null
    startDate: string | null
    endDate: string | null
    status: string | null
  }[] = []

  for (const y of conference.value.years) {
    entries.push({
      year: y.year,
      city: y.city,
      country: y.country,
      continent: y.continent,
      venue: y.venue,
      location_id: y.location_id,
      isUpcoming: y.type === 'upcoming',
      abstractDDL: y.abstract_ddl?.[0]?.date ?? null,
      paperDDL: y.paper_ddl?.[0]?.date ?? null,
      notificationDate: y.notification_date ?? null,
      cameraReady: y.camera_ready ?? null,
      startDate: y.start_date ?? null,
      endDate: y.end_date ?? null,
      status: y.status ?? null,
    })
  }

  return entries.sort((a, b) => b.year - a.year)
})

// 相关会议（同分类）
const relatedConferences = computed(() =>
  conferences.value.filter(
    (c) =>
      c.id !== conference.value?.id &&
      c.category === conference.value?.category,
  ),
)

function goToConference(id: string) {
  router.push(`/conference/${id}`)
}
</script>

<template>
  <div v-if="conference" class="container-page py-6">
    <!-- 返回 -->
    <button
      class="mb-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      @click="router.back()"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      返回
    </button>

    <!-- 会议标题 -->
    <div class="mb-6">
      <div class="mb-2 flex items-center gap-2">
        <BadgeTag
          :label="conference.category"
          :category="conference.category"
        />
        <span
          v-if="conference.aka?.length"
          class="text-xs text-gray-400"
        >
          AKA: {{ conference.aka.join(', ') }}
        </span>
      </div>
      <h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
        {{ conference.name }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        {{ conference.full_name }}
      </p>
      <a
        v-if="conference.website"
        :href="conference.website"
        target="_blank"
        rel="noopener"
        class="mt-2 inline-flex items-center gap-1 text-sm text-success hover:underline"
      >
        官网
        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>

    <!-- 时间轴 -->
    <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
      历年举办信息
    </h2>
    <div v-if="allEntries.length > 0">
      <ConferenceTimelineItem
        v-for="entry in allEntries"
        :key="entry.year"
        v-bind="entry"
      />
    </div>
    <p v-else class="py-8 text-center text-sm text-gray-400">
      暂无历史数据
    </p>

    <!-- 相关会议 -->
    <div v-if="relatedConferences.length > 0" class="mt-8">
      <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        同分类会议
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
    </div>
  </div>

  <!-- 会议不存在 -->
  <div v-else class="container-page py-20">
    <div class="flex flex-col items-center gap-4">
      <div class="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-gray-400">会议不存在</p>
      <button
        class="nav-chip"
        @click="router.push('/')"
      >
        返回首页
      </button>
    </div>
  </div>
</template>
