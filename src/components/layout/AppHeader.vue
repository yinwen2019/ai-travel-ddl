<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useSearch } from '@/composables/useSearch'
import { useMultiSelect } from '@/composables/useMultiSelect'
import { useYearSelect } from '@/composables/useYearSelect'
import { useConferences } from '@/composables/useConferences'
import { CATEGORY_CONFIG, CATEGORY_LIST } from '@/constants'
import type { Category } from '@/types/conference'
import SearchInput from '@/components/common/SearchInput.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import YearSelector from '@/components/navigation/YearSelector.vue'
import WorldCategoryBar from '@/components/world/WorldCategoryBar.vue'

const router = useRouter()
const route = useRoute()
const { isMobile } = useBreakpoint()
const { query, setQuery, clear: clearSearch } = useSearch()
const { groups, selectedIds, toggle, selectAll, deselectAll, clearAll } =
  useMultiSelect()
const { currentYear, setYear } = useYearSelect()
const { conferences } = useConferences()

const showMobileNav = ref(false)

const isCountdownView = computed(() => route.path === '/')
const isYearView = computed(() => route.path === '/year')
const isWorldView = computed(() => route.path === '/world')

// 每个分类对应的会议列表
const catConferences = computed(() => {
  const map = {} as Record<Category, typeof groups.value[number]['conferences']>
  for (const g of groups.value) {
    map[g.category] = g.conferences
  }
  return map
})

// 最大行数
const maxRows = computed(() =>
  Math.max(...CATEGORY_LIST.map((c) => (catConferences.value[c]?.length ?? 0)), 1),
)

// 年份范围（从所有会议数据动态计算）
const yearRange = computed(() => {
  const years = new Set<number>()
  for (const c of conferences.value) {
    for (const y of c.years) years.add(y.year)
  }
  return Array.from(years).sort((a, b) => b - a)
})

function onToggleCategory(cat: Category) {
  const ids = (catConferences.value[cat] ?? []).map((c) => c.id)
  const allSelected = ids.every((id) => selectedIds.has(id))
  if (allSelected) {
    deselectAll(ids)
  } else {
    selectAll(ids)
  }
}

function isCatAllSelected(cat: Category): boolean {
  const list = catConferences.value[cat] ?? []
  if (list.length === 0) return false
  return list.every((c) => selectedIds.has(c.id))
}

function isCatIndeterminate(cat: Category): boolean {
  const list = catConferences.value[cat] ?? []
  if (list.length === 0) return false
  const n = list.filter((c) => selectedIds.has(c.id)).length
  return n > 0 && n < list.length
}

const hasSelection = computed(() => selectedIds.size > 0)

function navigateTo(path: string) {
  showMobileNav.value = false
  router.push(path)
}

function onYearSelect(year: number) {
  setYear(year)
}

const navItems = [
  { path: '/', label: '会议视图' },
  { path: '/year', label: '年份视图' },
  { path: '/world', label: '世界视图' },
] as const
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95"
  >
    <!-- 顶栏：主导航 -->
    <div class="container-page flex h-14 items-center gap-4">
      <router-link to="/" class="flex shrink-0 items-center gap-2">
        <svg class="h-7 w-7" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" stroke="#10B981" stroke-width="2" fill="none" opacity="0.9"/>
          <polygon points="16,3 18.5,13 16,16 13.5,13" fill="#10B981"/>
          <polygon points="16,29 13.5,19 16,16 18.5,19" fill="#10B981" opacity="0.5"/>
          <polygon points="29,16 19,13.5 16,16 19,18.5" fill="#10B981" opacity="0.7"/>
          <polygon points="3,16 13,18.5 16,16 13,13.5" fill="#10B981" opacity="0.7"/>
          <circle cx="16" cy="16" r="2.5" fill="#059669"/>
          <circle cx="16" cy="16" r="5" stroke="#10B981" stroke-width="0.8" fill="none" opacity="0.4"/>
        </svg>
        <span class="text-lg font-bold text-gray-900 dark:text-white">
          AI Travel DDL
        </span>
      </router-link>

      <!-- 主导航按钮：会议视图 / 年份视图 -->
      <nav class="flex items-center gap-1" :class="{ 'hidden sm:flex': isMobile() }">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            route.path === item.path
              ? 'bg-success/10 text-success'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          "
          @click="navigateTo(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>

      <div class="flex-1" />

      <!-- 移动端导航按钮 -->
      <button
        v-if="isMobile()"
        class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          isCountdownView
            ? 'bg-success/10 text-success'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        "
        @click="navigateTo('/')"
      >
        会议
      </button>
      <button
        v-if="isMobile()"
        class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          isYearView
            ? 'bg-success/10 text-success'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        "
        @click="navigateTo('/year')"
      >
        年份
      </button>
      <button
        v-if="isMobile()"
        class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          isWorldView
            ? 'bg-success/10 text-success'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        "
        @click="navigateTo('/world')"
      >
        世界
      </button>

      <SearchInput
        v-model="query"
        :class="isMobile() ? 'w-24' : 'w-40 lg:w-52'"
        @search="setQuery"
      />

      <ThemeToggle />

      <button
        v-if="isMobile()"
        class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="showMobileNav = !showMobileNav"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!showMobileNav" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 会议视图：分类筛选转置表格 -->
    <div
      v-if="isCountdownView"
      class="border-t bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90"
      :class="{ hidden: isMobile() && !showMobileNav }"
    >
      <div class="container-page py-2">
        <div
          class="grid gap-x-2 gap-y-1 text-xs"
          :style="{ gridTemplateColumns: `repeat(${CATEGORY_LIST.length}, 1fr)` }"
        >
          <!-- 表头：分类名 + 全选 -->
          <div
            v-for="cat in CATEGORY_LIST"
            :key="'h-' + cat"
            class="flex items-center gap-1.5 rounded px-1.5 py-0.5"
          >
            <input
              type="checkbox"
              class="rounded"
              :checked="isCatAllSelected(cat)"
              :indeterminate.prop="isCatIndeterminate(cat)"
              @change="onToggleCategory(cat)"
            />
            <span
              class="cursor-pointer font-medium"
              :class="
                isCatAllSelected(cat) || isCatIndeterminate(cat)
                  ? 'text-success'
                  : 'text-gray-600 dark:text-gray-400'
              "
              @click="onToggleCategory(cat)"
            >
              {{ CATEGORY_CONFIG[cat].label }}
            </span>
          </div>

          <!-- 数据行 -->
          <template v-for="row in maxRows" :key="'r-' + row">
            <div
              v-for="cat in CATEGORY_LIST"
              :key="cat + '-' + row"
              class="flex items-center rounded px-1.5 py-0.5"
            >
              <template v-if="catConferences[cat]?.[row - 1]">
                <label
                  class="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-gray-900 dark:hover:text-white"
                  :class="
                    selectedIds.has(catConferences[cat][row - 1].id)
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500'
                  "
                >
                  <input
                    type="checkbox"
                    class="rounded"
                    :checked="selectedIds.has(catConferences[cat][row - 1].id)"
                    @change="toggle(catConferences[cat][row - 1].id)"
                  />
                  {{ catConferences[cat][row - 1].name }}
                </label>
              </template>
            </div>
          </template>
        </div>

        <!-- 底部栏 -->
        <div class="mt-1 flex items-center gap-2 border-t border-gray-100 pt-1.5 dark:border-gray-700">
          <span class="text-xs text-gray-400">
            {{ hasSelection ? `已选 ${selectedIds.size} 个会议` : '未选择 — 默认展示全部' }}
          </span>

          <div class="flex-1" />

          <button
            v-if="hasSelection"
            class="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            @click="clearAll(); clearSearch()"
          >
            清空选择
          </button>
        </div>
      </div>
    </div>

    <!-- 年份视图：年份选择器 -->
    <div
      v-if="isYearView && yearRange.length > 0"
      class="border-t bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90"
      :class="{ hidden: isMobile() && !showMobileNav }"
    >
      <div class="container-page">
        <YearSelector
          :years="yearRange"
          :current="currentYear"
          @select="onYearSelect"
        />
      </div>
    </div>

    <!-- 世界视图：分类筛选 -->
    <div
      v-if="isWorldView"
      class="border-t bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90"
      :class="{ hidden: isMobile() && !showMobileNav }"
    >
      <div class="container-page py-2">
        <WorldCategoryBar />
      </div>
    </div>
  </header>
</template>
