<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCityDirectory } from '@/composables/useCityDirectory'
import { CONTINENT_LABELS } from '@/constants'
import ClimateCard from './ClimateCard.vue'
import FoodList from './FoodList.vue'
import AttractionList from './AttractionList.vue'

const route = useRoute()
const { getById } = useCityDirectory()
const city = computed(() => getById(String(route.params.id)))
const guide = computed(() => city.value?.guide)
const conferenceGroups = computed(() => {
  const groups = new Map<string, { id: string; name: string; years: number[] }>()
  for (const record of city.value?.conferences ?? []) {
    const group = groups.get(record.conferenceId) ?? {
      id: record.conferenceId,
      name: record.conferenceName,
      years: [],
    }
    group.years.push(record.entry.year)
    groups.set(record.conferenceId, group)
  }
  return [...groups.values()]
})
// 沿用会议数据的 upcoming 标记；已结束会期不再显示为待参会。
const upcoming = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return (city.value?.conferences ?? [])
    .filter(
      (record) =>
        record.entry.type === 'upcoming' &&
        (!record.entry.end_date || record.entry.end_date >= today),
    )
    .sort(
      (a, b) =>
        a.entry.year - b.entry.year ||
        (a.entry.start_date ?? '9999').localeCompare(b.entry.start_date ?? '9999'),
    )
})
</script>

<template>
  <div v-if="city" class="container-page page-content city-detail">
    <nav class="city-breadcrumb" aria-label="面包屑">
      <router-link to="/cities" class="text-link">城市视图</router-link
      ><span aria-hidden="true">/</span><span aria-current="page">{{ city.city }}</span>
    </nav>
    <header class="city-detail-header">
      <h1 class="page-title">{{ city.city }}</h1>
      <p class="city-detail-place">
        {{ city.country
        }}<template v-if="city.continent"> · {{ CONTINENT_LABELS[city.continent] }}</template>
      </p>
      <p class="city-detail-description">
        {{
          guide?.description ||
          '这座城市的旅行介绍待公布。你可以先查看这里的会议记录，安排参会行程。'
        }}
      </p>
    </header>
    <dl class="city-quick-facts">
      <div>
        <dt>适宜旅行季节</dt>
        <dd>{{ guide?.best_season || '待公布' }}</dd>
      </div>
      <div>
        <dt>当地语言</dt>
        <dd>{{ guide?.language || '待公布' }}</dd>
      </div>
      <div>
        <dt>当地货币</dt>
        <dd>{{ guide?.currency || '待公布' }}</dd>
      </div>
    </dl>
    <p v-if="!guide" class="city-pending-note">
      景点、美食、气候和旅行贴士待公布；下方保留已收录的会议记录。
    </p>
    <div class="city-detail-layout">
      <div class="city-detail-main">
        <AttractionList :attractions="guide?.attractions" />
        <FoodList :food="guide?.food" />
        <ClimateCard :climate="guide?.climate" />
      </div>
      <aside class="city-detail-aside" aria-label="参会与出行信息">
        <section class="city-info-section">
          <h2>出行贴士</h2>
          <p>{{ guide?.travel_tips || '交通与出行资料待公布。' }}</p>
        </section>
        <section v-if="upcoming.length" class="city-info-section">
          <h2>接下来在这里相遇</h2>
          <ul class="city-upcoming-list">
            <li v-for="record in upcoming" :key="`${record.conferenceId}-${record.entry.year}`">
              <router-link :to="`/conference/${record.conferenceId}`" class="text-link"
                >{{ record.conferenceName }} {{ record.entry.year }}</router-link
              >
              <p>
                会期 {{ record.entry.start_date || '待公布'
                }}<template
                  v-if="record.entry.end_date && record.entry.end_date !== record.entry.start_date"
                >
                  至 {{ record.entry.end_date }}</template
                >
              </p>
              <p v-if="record.entry.venue">{{ record.entry.venue }}</p>
            </li>
          </ul>
        </section>
        <section class="city-info-section">
          <h2>在这里举办的会议</h2>
          <p v-if="city.conferences.length" class="city-conference-count">
            收录 {{ city.conferences.length }} 届会议，含历史与已公布届次。
          </p>
          <ul v-if="conferenceGroups.length" class="city-conference-list">
            <li v-for="conference in conferenceGroups" :key="conference.id">
              <router-link :to="`/conference/${conference.id}`" class="text-link">{{
                conference.name
              }}</router-link>
              <p>{{ conference.years.join('、') }}</p>
            </li>
          </ul>
          <p v-else>关联会议待公布。</p>
        </section>
        <p class="city-source-note">
          旅行资料供行程参考，开放时间、交通及入境要求请以当地官方最新信息为准。
        </p>
      </aside>
    </div>
  </div>
  <div v-else class="container-page page-content">
    <div class="empty-state">
      <h1 class="page-title">未找到这座城市</h1>
      <p>这个城市地址可能已变更，请从城市视图重新选择。</p>
      <router-link to="/cities" class="nav-chip">浏览全部城市</router-link>
    </div>
  </div>
</template>
