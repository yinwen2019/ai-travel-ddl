<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCityDirectory } from '@/composables/useCityDirectory'
import { normalizeCityText } from '@/utils/cityDirectory'
import { CONTINENT_LABELS } from '@/constants'
import SearchInput from '@/components/common/SearchInput.vue'
import CityCard from '@/components/location/CityCard.vue'
import CityLink from '@/components/location/CityLink.vue'

const route = useRoute()
const router = useRouter()
const { cities } = useCityDirectory()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const continent = ref(typeof route.query.continent === 'string' ? route.query.continent : '')
const guidesOnly = ref(route.query.guide === '1')
const continents = computed(() => [
  ...new Set(cities.value.map((city) => city.continent).filter((value) => value != null)),
])
const guideCount = computed(() => cities.value.filter((city) => city.guide).length)
const filteredCities = computed(() => {
  const terms = normalizeCityText(query.value).split(/\s+/).filter(Boolean)
  return cities.value.filter((city) => {
    if (continent.value && city.continent !== continent.value) return false
    if (guidesOnly.value && !city.guide) return false
    const searchable = normalizeCityText(
      [
        city.city,
        city.country,
        city.continent && CONTINENT_LABELS[city.continent],
        city.guide?.description,
        ...(city.guide?.attractions?.map((item) => item.name) ?? []),
        ...(city.guide?.food?.map((item) => item.name) ?? []),
      ].join(' '),
    )
    return terms.every((term) => searchable.includes(term))
  })
})
const guideCities = computed(() => filteredCities.value.filter((city) => city.guide))
const otherCities = computed(() => filteredCities.value.filter((city) => !city.guide))

// 筛选写入地址，刷新或返回城市总览时可恢复浏览上下文。
watch([query, continent, guidesOnly], () => {
  void router.replace({
    query: {
      q: query.value || undefined,
      continent: continent.value || undefined,
      guide: guidesOnly.value ? '1' : undefined,
    },
  })
})
watch(
  () => route.query,
  (value) => {
    query.value = typeof value.q === 'string' ? value.q : ''
    continent.value = typeof value.continent === 'string' ? value.continent : ''
    guidesOnly.value = value.guide === '1'
  },
)
function clearFilters() {
  query.value = ''
  continent.value = ''
  guidesOnly.value = false
}
</script>

<template>
  <div class="container-page page-content city-directory">
    <div class="page-heading">
      <div>
        <h1 class="page-title">城市视图</h1>
        <p class="page-description">
          从会议出发，认识下一座城市。找景点、看季节，也留点时间尝尝当地美食。
        </p>
      </div>
      <router-link to="/world" class="text-link city-world-link">在世界地图探索</router-link>
    </div>
    <p class="city-coverage">
      收录 {{ cities.length }} 座举办城市，{{
        guideCount
      }}
      座已有旅行指南。城市详情均在新标签页打开。
    </p>
    <section class="city-toolbar" aria-label="筛选城市">
      <div class="city-search-row">
        <SearchInput
          v-model="query"
          label="搜索城市、国家、景点或美食"
          placeholder="搜索城市、国家、景点或美食…"
        />
        <label class="city-guide-toggle"
          ><input v-model="guidesOnly" type="checkbox" />仅看有旅行指南的城市</label
        >
      </div>
      <div class="city-continent-filters" role="group" aria-label="按大洲筛选">
        <button
          class="nav-chip"
          :class="{ active: !continent }"
          :aria-pressed="!continent"
          @click="continent = ''"
        >
          全部城市
        </button>
        <button
          v-for="item in continents"
          :key="item"
          class="nav-chip"
          :class="{ active: continent === item }"
          :aria-pressed="continent === item"
          @click="continent = item"
        >
          {{ CONTINENT_LABELS[item] }}
        </button>
      </div>
    </section>
    <div class="city-result-status">
      <p role="status">显示 {{ filteredCities.length }} 座城市</p>
      <button
        class="text-link"
        :disabled="!query && !continent && !guidesOnly"
        @click="clearFilters"
      >
        重置筛选
      </button>
    </div>
    <div v-if="!filteredCities.length" class="empty-state">
      <h2 class="text-lg font-semibold text-primary">没有找到匹配的城市</h2>
      <p>试试城市英文名、国家，或清除筛选后浏览全部城市。</p>
      <button class="nav-chip" @click="clearFilters">浏览全部城市</button>
    </div>
    <section v-if="guideCities.length" aria-labelledby="city-guides-heading">
      <h2 id="city-guides-heading" class="city-section-heading">城市旅行指南</h2>
      <div class="city-guide-grid">
        <CityCard v-for="city in guideCities" :key="city.id" :city="city" />
      </div>
    </section>
    <section
      v-if="otherCities.length"
      class="city-other-section"
      aria-labelledby="city-other-heading"
    >
      <h2 id="city-other-heading" class="city-section-heading">
        {{ guideCities.length ? '更多会议目的地' : '会议目的地' }}
      </h2>
      <p class="page-description mb-4">可以查看各城市的关联会议；景点、美食和季节资料待公布。</p>
      <ul class="city-compact-grid">
        <li v-for="city in otherCities" :key="city.id">
          <div>
            <CityLink :city="city.city" :country="city.country" />
            <p>{{ city.country }}</p>
          </div>
          <span>{{ city.conferences.length }} 届会议</span>
        </li>
      </ul>
    </section>
  </div>
</template>
