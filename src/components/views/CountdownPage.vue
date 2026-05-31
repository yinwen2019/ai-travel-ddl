<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { useMultiSelect } from '@/composables/useMultiSelect'
import ConferenceColumn from '@/components/conference/ConferenceColumn.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

const { filteredConferences, isFiltering, clear: clearSearch } = useSearch()
const { selectedConferences } = useMultiSelect()

const loading = ref(true)
setTimeout(() => {
  loading.value = false
}, 500)

// 勾选了会议 → 只显示选中的；否则显示全部（受搜索过滤）
const conferencesSource = computed(() => {
  if (selectedConferences.value.length > 0) return selectedConferences.value
  return filteredConferences.value
})
</script>

<template>
  <div class="container-page py-4">
    <!-- 骨架屏 -->
    <template v-if="loading">
      <div class="flex gap-4">
        <SkeletonCard v-for="n in 6" :key="n" :count="1" />
      </div>
    </template>

    <!-- 空状态 -->
    <EmptyState
      v-else-if="filteredConferences.length === 0"
      :message="isFiltering ? '没有符合条件的会议' : '暂无会议数据'"
      :variant="isFiltering ? 'no-results' : 'empty'"
      @clear="clearSearch"
    />

    <!-- 会议列 -->
    <div
      v-else
      class="flex gap-4 overflow-x-auto pb-4"
    >
      <ConferenceColumn
        v-for="c in conferencesSource"
        :key="c.id"
        :conference="c"
      />
    </div>
  </div>
</template>
