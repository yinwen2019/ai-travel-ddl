import { ref, computed } from 'vue'
import type { Conference, Category } from '@/types/conference'
import { useConferences } from './useConferences'

const query = ref('')
const activeCategory = ref<Category | null>(null)

export function useSearch() {
  const { conferences } = useConferences()

  function setQuery(q: string) {
    query.value = q
  }

  function setCategory(cat: Category) {
    activeCategory.value = activeCategory.value === cat ? null : cat
  }

  function clear() {
    query.value = ''
    activeCategory.value = null
  }

  const filteredConferences = computed<Conference[]>(() => {
    let result = conferences.value

    // 分类筛选
    if (activeCategory.value) {
      result = result.filter((c) => c.category === activeCategory.value)
    }

    // 文字搜索
    const q = query.value.toLowerCase().trim()
    if (q) {
      result = result.filter((c) => {
        const matchName = c.name.toLowerCase().includes(q)
        const matchFull = c.full_name.toLowerCase().includes(q)
        const matchAka = c.aka?.some((a) => a.toLowerCase().includes(q)) ?? false
        const matchCategory = c.category.toLowerCase().includes(q)
        return matchName || matchFull || matchAka || matchCategory
      })
    }

    return result
  })

  const isFiltering = computed(
    () => query.value.trim().length > 0 || activeCategory.value !== null,
  )

  return {
    query,
    activeCategory,
    setQuery,
    setCategory,
    clear,
    filteredConferences,
    isFiltering,
  }
}
