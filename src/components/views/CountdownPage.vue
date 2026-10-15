<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { useMultiSelect } from '@/composables/useMultiSelect'
import ConferenceRow from '@/components/conference/ConferenceRow.vue'
import ConferenceFilters from '@/components/navigation/ConferenceFilters.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import EmptyState from '@/components/common/EmptyState.vue'
const { query, filteredConferences, isFiltering, clear: clearSearch } = useSearch()
const { selectedIds, clearAll } = useMultiSelect()
const filtersOpen = ref(false)
// 搜索与会议选择取交集，空状态和计数使用同一数据源。
const conferencesSource = computed(() =>
  filteredConferences.value.filter((c) => !selectedIds.size || selectedIds.has(c.id)),
)
</script>
<template>
  <div class="container-page page-content">
    <div class="page-heading">
      <div>
        <h1 class="page-title">会议视图</h1>
        <p class="page-description">从下一次投稿，到下一个目的地。</p>
      </div>
      <div class="view-toolbar">
        <SearchInput v-model="query" />
        <button
          class="control-button md:hidden"
          :aria-expanded="filtersOpen"
          aria-controls="conference-filters"
          @click="filtersOpen = !filtersOpen"
        >
          筛选会议
        </button>
      </div>
    </div>
    <ConferenceFilters :open="filtersOpen" />
    <div class="conference-filter-toolbar">
      <p role="status" aria-atomic="true">
        显示 <span class="filter-result-count">{{ conferencesSource.length }}</span> 个会议
      </p>
      <button
        type="button"
        class="text-link filter-reset"
        :disabled="!selectedIds.size"
        @click="clearAll"
      >
        清空选择
      </button>
    </div>
    <EmptyState
      v-if="!conferencesSource.length"
      :message="isFiltering || selectedIds.size ? '没有符合当前搜索与选择的会议' : '暂无会议数据'"
      variant="empty"
    >
      <div class="empty-actions">
        <button v-if="isFiltering" class="control-button" @click="clearSearch">清除搜索</button>
      </div>
    </EmptyState>
    <div v-else class="conference-rows">
      <ConferenceRow v-for="c in conferencesSource" :key="c.id" :conference="c" />
    </div>
  </div>
</template>
