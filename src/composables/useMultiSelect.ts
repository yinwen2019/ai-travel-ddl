import { reactive, computed } from 'vue'
import type { Conference } from '@/types/conference'
import { useConferences } from './useConferences'

export interface CategoryGroup {
  name: string
  category: string
  conferences: Conference[]
}

const selectedIds = reactive(new Set<string>())

export function useMultiSelect() {
  const { conferences } = useConferences()

  const groups = computed<CategoryGroup[]>(() => {
    const groupMap: Record<string, Conference[]> = {}
    for (const c of conferences.value) {
      if (!groupMap[c.category]) groupMap[c.category] = []
      groupMap[c.category].push(c)
    }
    const labels: Record<string, string> = {
      CV: '计算机视觉',
      NLP: '自然语言处理',
      ML: '机器学习',
      AI: '人工智能',
      DM: '数据挖掘',
    }
    return Object.entries(groupMap).map(([category, confs]) => ({
      name: labels[category] || category,
      category,
      conferences: confs,
    }))
  })

  const selectedConferences = computed<Conference[]>(() =>
    conferences.value.filter((c) => selectedIds.has(c.id)),
  )

  function toggle(id: string) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id)
    } else {
      selectedIds.add(id)
    }
  }

  function selectAll(ids: string[]) {
    for (const id of ids) selectedIds.add(id)
  }

  function deselectAll(ids: string[]) {
    for (const id of ids) selectedIds.delete(id)
  }

  function clearAll() {
    selectedIds.clear()
  }

  function isSelected(id: string): boolean {
    return selectedIds.has(id)
  }

  return { selectedIds, groups, selectedConferences, toggle, selectAll, deselectAll, clearAll, isSelected }
}
