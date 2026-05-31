<script setup lang="ts">
import { useMultiSelect } from '@/composables/useMultiSelect'
import CategoryGroupComp from './CategoryGroup.vue'

const { groups, selectedIds, toggle, selectAll, deselectAll, clearAll, isSelected } =
  useMultiSelect()

function onCategoryToggle(group: (typeof groups.value)[number]) {
  const ids = group.conferences.map((c) => c.id)
  const allSelected = ids.every((id) => isSelected(id))
  if (allSelected) {
    deselectAll(ids)
  } else {
    selectAll(ids)
  }
}
</script>

<template>
  <aside class="hidden w-52 shrink-0 space-y-2 lg:block">
    <!-- 标题行 -->
    <div class="flex items-center justify-between px-1">
      <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">
        分类筛选
      </span>
      <button
        v-if="selectedIds.size > 0"
        class="text-xs text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        @click="clearAll"
      >
        清空 ({{ selectedIds.size }})
      </button>
    </div>

    <!-- 分类组 -->
    <CategoryGroupComp
      v-for="group in groups"
      :key="group.category"
      :group="group"
      :selected-ids="selectedIds"
      @toggle-category="onCategoryToggle(group)"
      @toggle-conf="toggle"
    />

    <!-- 底部提示 -->
    <p class="px-1 text-xs text-gray-400">
      {{ selectedIds.size > 0 ? `已选 ${selectedIds.size} 个会议` : '默认显示全部会议' }}
    </p>
  </aside>
</template>
