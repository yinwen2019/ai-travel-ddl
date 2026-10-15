<script setup lang="ts">
import type { CityCardProps } from '@/types/location'
defineProps<CityCardProps>()
</script>

<template>
  <article class="city-card">
    <div class="city-card-heading">
      <div>
        <h3>
          <router-link
            :to="{ name: 'city', params: { id: city.id } }"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${city.city}，在新标签页查看城市`"
            >{{ city.city }}</router-link
          >
        </h3>
        <p>{{ city.country }}</p>
      </div>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path d="M14 4h6v6m0-6L10 14M10 4H4v16h16v-6" />
      </svg>
    </div>
    <p class="city-card-description">{{ city.guide?.description || '城市介绍待公布。' }}</p>
    <dl class="city-card-facts">
      <div>
        <dt>代表景点</dt>
        <dd>{{ city.guide?.attractions?.map((item) => item.name).join(' / ') || '待公布' }}</dd>
      </div>
      <div>
        <dt>适宜季节</dt>
        <dd>{{ city.guide?.best_season || '待公布' }}</dd>
      </div>
      <div>
        <dt>当地美食</dt>
        <dd>{{ city.guide?.food?.map((item) => item.name).join(' / ') || '待公布' }}</dd>
      </div>
    </dl>
    <p class="city-card-footer">
      {{ city.conferences.length }} 届关联会议<span>城市详情在新标签页打开</span>
    </p>
  </article>
</template>
