<script setup lang="ts">
import type { AttractionListProps } from '@/types/location'
withDefaults(defineProps<AttractionListProps>(), { attractions: () => [] })
const typeLabels: Record<string, string> = {
  nature: '自然风光',
  park: '公园',
  beach: '海滩',
  market: '集市',
  historic: '历史文化',
  architecture: '建筑',
  museum: '博物馆',
  adventure: '户外体验',
  hike: '徒步',
  landmark: '城市地标',
  entertainment: '文化娱乐',
  street: '街区',
  food: '美食街区',
}
</script>

<template>
  <section class="city-content-section" aria-labelledby="city-attractions-heading">
    <h2 id="city-attractions-heading">值得一看的地方</h2>
    <ul v-if="attractions.length" class="city-editorial-list">
      <li v-for="item in attractions" :key="item.name">
        <div class="city-item-title">
          <h3>{{ item.name }}</h3>
          <span v-if="item.type && typeLabels[item.type]">{{ typeLabels[item.type] }}</span>
        </div>
        <p>{{ item.description || '景点介绍待公布。' }}</p>
      </li>
    </ul>
    <p v-else class="city-section-empty">景点资料待公布。</p>
  </section>
</template>
