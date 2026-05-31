<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryGroup } from '@/composables/useMultiSelect'

const props = defineProps<{
  group: CategoryGroup
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  toggleCategory: []
  toggleConf: [id: string]
}>()

const childIds = computed(() => props.group.conferences.map((c) => c.id))
const selectedCount = computed(() => childIds.value.filter((id) => props.selectedIds.has(id)).length)
const totalCount = computed(() => childIds.value.length)

// 父级复选框状态
const isAllSelected = computed(() => selectedCount.value === totalCount.value && totalCount.value > 0)
const isIndeterminate = computed(() => selectedCount.value > 0 && selectedCount.value < totalCount.value)
</script>

<template>
  <div class="rounded-lg border border-gray-100 p-2 dark:border-gray-800">
    <!-- 父级行 -->
    <label
      class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      <input
        type="checkbox"
        class="rounded"
        :checked="isAllSelected"
        :indeterminate.prop="isIndeterminate"
        @change="emit('toggleCategory')"
      />
      <span class="font-medium text-gray-900 dark:text-white">
        {{ group.name }}
      </span>
      <span class="ml-auto text-xs text-gray-400">
        {{ selectedCount }}/{{ totalCount }}
      </span>
    </label>

    <!-- 子级列表 -->
    <div class="ml-5 mt-0.5 space-y-0.5">
      <label
        v-for="conf in group.conferences"
        :key="conf.id"
        class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <input
          type="checkbox"
          class="rounded"
          :checked="selectedIds.has(conf.id)"
          @change="emit('toggleConf', conf.id)"
        />
        <span class="text-gray-700 dark:text-gray-300">
          {{ conf.name }}
        </span>
        <span class="ml-auto text-xs text-gray-400">
          {{ conf.years.filter((y) => y.type === 'upcoming').length > 0 ? conf.years.filter((y) => y.type === 'upcoming')[0].year : '' }}
        </span>
      </label>
    </div>
  </div>
</template>
