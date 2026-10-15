<script setup lang="ts">
import { computed } from 'vue'
import type { HomeCityRankingProps } from '@/types/home'

const props = defineProps<HomeCityRankingProps>()
const maximum = computed(() => Math.max(1, ...props.entries.map((entry) => entry.count)))
const countries = computed(() =>
  props.entries.filter(
    (entry, index, entries) =>
      entries.findIndex((candidate) => candidate.city.country === entry.city.country) === index,
  ),
)
</script>

<template>
  <section class="home-ranking" aria-labelledby="home-ranking-title">
    <div class="home-ranking-heading">
      <div>
        <h2 id="home-ranking-title">城市举办榜</h2>
        <p>历史线下届次 · 前 {{ entries.length }} 座城市</p>
      </div>
      <router-link to="/cities" class="home-ranking-all">
        全部城市
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      </router-link>
    </div>

    <ol v-if="entries.length" class="home-ranking-list" aria-label="按历史举办届次排序的城市">
      <li
        v-for="entry in entries"
        :key="entry.city.id"
        class="home-ranking-row"
        :style="{ '--country-color': `var(--home-country-${entry.countryTone})` }"
      >
        <router-link
          :to="{ name: 'city', params: { id: entry.city.id } }"
          target="_blank"
          rel="noopener"
          :aria-label="`${entry.tied ? '并列' : ''}第 ${entry.rank}，${entry.city.city}，${entry.city.country}，${entry.count} 届；城市详情在新标签页打开`"
        >
          <span class="home-rank-position">{{ entry.tied ? '=' : '' }}{{ entry.rank }}</span>
          <span class="home-rank-city">
            <strong>{{ entry.city.city }}</strong>
            <span>{{ entry.city.country }}</span>
          </span>
          <span class="home-rank-track" aria-hidden="true">
            <span :style="{ width: `${(entry.count / maximum) * 100}%` }" />
          </span>
          <span class="home-rank-count">{{ entry.count }}<span class="sr-only"> 届</span></span>
        </router-link>
      </li>
    </ol>
    <p v-else class="home-ranking-empty">暂未收录历史线下举办记录。</p>

    <div v-if="entries.length" class="home-ranking-legend" aria-label="国家颜色图例">
      <span
        v-for="entry in countries"
        :key="entry.city.country"
        :style="{ '--country-color': `var(--home-country-${entry.countryTone})` }"
      >
        <i aria-hidden="true" />{{ entry.city.country }}
      </span>
    </div>
    <p class="home-ranking-note">
      基于本站收录记录，线上及未来届次不计入；城市详情在新标签页打开。
    </p>
  </section>
</template>
