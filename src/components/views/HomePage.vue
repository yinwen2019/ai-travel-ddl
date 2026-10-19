<script setup lang="ts">
import { useHomeOverview } from '@/composables/useHomeOverview'
import HomeGlobe from '@/components/home/HomeGlobe.vue'
import HomeRankings from '@/components/home/HomeRankings.vue'
import HomeCommunity from '@/components/home/HomeCommunity.vue'

const { conferenceCount, cityCount } = useHomeOverview()
const views = [
  { path: '/world', title: '世界视图', description: '在地图上，追寻学术足迹', name: 'World' },
  {
    path: '/conference',
    title: '会议视图',
    description: '关注会议，追踪历年届次',
    name: 'Conference',
  },
  { path: '/year', title: '年份视图', description: '按年份，安排研究日程', name: 'Year' },
  { path: '/cities', title: '城市视图', description: '看景点、季节与当地美食', name: 'City' },
]
</script>

<template>
  <div class="home-page">
    <div class="home-container">
      <section class="home-hero" aria-labelledby="home-title">
        <div class="home-intro">
          <h1 id="home-title"><span>从一场会议，</span><span>出发看世界。</span></h1>
          <p class="home-description">
            追踪 AI 顶会的投稿时间，<br />探索每一次学术相遇背后的城市。
          </p>
          <div class="home-actions">
            <router-link to="/world" class="home-primary-action">
              展开世界地图
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </router-link>
            <router-link to="/conference" class="home-secondary-action">查看会议 DDL</router-link>
          </div>
          <p class="home-coverage">
            {{ conferenceCount }} 个 AI 会议，{{ cityCount }} 座学术城市。
          </p>
          <HomeCommunity />
        </div>
        <div class="home-atlas">
          <HomeGlobe />
          <HomeRankings />
        </div>
      </section>

      <nav class="home-views" aria-label="探索四个功能视图">
        <router-link v-for="view in views" :key="view.path" :to="view.path" class="home-view-link">
          <div class="home-view-title">
            <h2>{{ view.title }}</h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </div>
          <p>{{ view.description }}</p>
          <span class="home-view-name" lang="en">{{ view.name }}</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>
