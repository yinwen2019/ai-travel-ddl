<script setup lang="ts">
import { CATEGORY_LIST, CATEGORY_CONFIG } from '@/constants'
import { useMultiSelect } from '@/composables/useMultiSelect'
import type { Category } from '@/types/conference'
import type { ConferenceFiltersProps } from '@/types/view'
defineProps<ConferenceFiltersProps>()
const { groups, selectedIds, toggle, selectAll, deselectAll, clearAll } = useMultiSelect()
function groupIds(category: Category) {
  return groups.value.find((g) => g.category === category)?.conferences.map((c) => c.id) ?? []
}
function allSelected(category: Category) {
  const ids = groupIds(category)
  return ids.length > 0 && ids.every((id) => selectedIds.has(id))
}
function indeterminate(category: Category) {
  return !allSelected(category) && groupIds(category).some((id) => selectedIds.has(id))
}
function toggleCategory(category: Category) {
  const ids = groupIds(category)
  if (allSelected(category)) deselectAll(ids)
  else selectAll(ids)
}
</script>
<template>
  <div id="conference-filters" class="filter-panel" :class="{ 'is-open': open }">
    <div class="filter-groups">
      <div v-for="category in CATEGORY_LIST" :key="category" class="filter-group">
        <label class="filter-group-heading">
          <input
            type="checkbox"
            :checked="allSelected(category)"
            :indeterminate.prop="indeterminate(category)"
            @change="toggleCategory(category)"
          />
          {{ CATEGORY_CONFIG[category].label }}
        </label>
        <div class="filter-group-list">
          <label
            v-for="conference in groups.find((g) => g.category === category)?.conferences ?? []"
            :key="conference.id"
          >
            <input
              type="checkbox"
              :checked="selectedIds.has(conference.id)"
              @change="toggle(conference.id)"
            />
            {{ conference.name }}
          </label>
        </div>
      </div>
    </div>
    <div class="filter-footer">
      <span>{{
        selectedIds.size ? `已选 ${selectedIds.size} 个会议` : '未选择时展示全部会议'
      }}</span>
      <button v-if="selectedIds.size" class="text-link min-h-11" @click="clearAll">清空选择</button>
    </div>
  </div>
</template>
