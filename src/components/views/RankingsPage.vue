<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchInput from '@/components/common/SearchInput.vue'
import AnalyticsNotice from '@/components/common/AnalyticsNotice.vue'
import { analytics } from '@/services/analytics'
import { useCommunitySignals } from '@/composables/useCommunitySignals'
import { useRankings } from '@/composables/useRankings'
import type { RankingEntry, RankingKind } from '@/types/rankings'
import { normalizeCityText } from '@/utils/cityDirectory'
import '@/styles/rankings-page.css'

const route = useRoute()
const router = useRouter()
const { boards, entriesFor } = useRankings()
const { addCityVote, getCityVotes, storageAvailable } = useCommunitySignals()
const voteMessage = ref('')
const votePulses = ref<Record<string, number>>({})

const boardId = computed<RankingKind>(() => {
  const requested = route.query.board
  return boards.find((board) => board.id === requested)?.id ?? 'hosting'
})
const activeBoard = computed(() => boards.find((board) => board.id === boardId.value) ?? boards[0])
const isHeatBoard = computed(
  () => boardId.value === 'conference-heat' || boardId.value === 'city-heat',
)
const isWishlist = computed(() => boardId.value === 'city-wishlist')
const query = computed({
  get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
  set: (value: string) => {
    // 搜索替换当前地址，切换榜单保留历史，浏览器返回可恢复查询。
    void router.replace({
      query: { ...route.query, board: boardId.value, q: value || undefined },
    })
  },
})
const entries = computed(() => entriesFor(boardId.value))
const filteredEntries = computed(() => {
  const terms = normalizeCityText(query.value).split(/\s+/).filter(Boolean)
  // 搜索只筛选已有榜单，保留完整榜单的真实名次。
  return entries.value.filter((entry) => {
    const searchable = normalizeCityText(`${entry.name} ${entry.subtitle} ${entry.detail}`)
    return terms.every((term) => searchable.includes(term))
  })
})

function selectBoard(kind: RankingKind) {
  if (kind === boardId.value) return
  voteMessage.value = ''
  void router.push({ query: { ...route.query, board: kind } })
}

function castVote(entry: RankingEntry) {
  if (!entry.cityId) return
  if (!addCityVote(entry.cityId)) {
    voteMessage.value = analytics.problem.value || '暂时无法投票'
    return
  }
  const count = getCityVotes(entry.cityId)
  // 每次点击替换局部反馈节点，快速连点可重新触发，不累积计时器。
  votePulses.value[entry.id] = (votePulses.value[entry.id] ?? 0) + 1
  voteMessage.value = analytics.enabled
    ? `已为 ${entry.name} 提交一票，正在同步。`
    : `已为 ${entry.name} 承办会议投一票，本机累计 ${count} 票。`
}

function rankLabel(entry: RankingEntry): string {
  if (entry.rank === null) return '—'
  return `${entry.tied ? '=' : ''}${entry.rank}`
}
</script>

<template>
  <div class="container-page page-content rankings-page">
    <header class="page-heading rankings-page-heading">
      <div>
        <h1 class="page-title">每一场相遇，都有迹可循。</h1>
        <p class="page-description">从已发生的学术足迹，到下一场会议的举办城市。</p>
      </div>
      <router-link to="/world" class="text-link rankings-map-link">
        在世界地图探索
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          aria-hidden="true"
        >
          <path d="M6 18 18 6M6 6h12v12" />
        </svg>
      </router-link>
    </header>

    <div class="rankings-board-switcher" role="group" aria-label="切换排行榜">
      <button
        v-for="board in boards"
        :key="board.id"
        type="button"
        class="rankings-board-button"
        :class="{ 'is-current': board.id === boardId }"
        :aria-pressed="board.id === boardId"
        @click="selectBoard(board.id)"
      >
        <span class="rankings-board-title">{{ board.title }}</span>
        <span class="rankings-board-description">{{ board.description }}</span>
      </button>
    </div>

    <AnalyticsNotice />
    <section class="rankings-layout" aria-labelledby="rankings-current-heading">
      <div class="rankings-list-top">
        <div class="rankings-list-heading">
          <h2 id="rankings-current-heading">{{ activeBoard.title }}</h2>
          <span v-if="isWishlist" class="rankings-local-label">{{
            analytics.enabled ? '全站累计' : '仅本机记录'
          }}</span>
          <span v-else-if="isHeatBoard" class="rankings-pending-label">{{
            analytics.enabled ? '全站累计' : '尚未开启'
          }}</span>
        </div>
        <template v-if="!isHeatBoard || entries.length > 0">
          <SearchInput
            v-model="query"
            label="搜索榜单中的城市、国家或会议"
            placeholder="搜索城市、国家或会议…"
          />
          <div class="rankings-results-status">
            <p role="status">
              显示 {{ filteredEntries.length }} / {{ entries.length }}
              {{ boardId === 'conference-heat' ? '个会议' : isWishlist ? '座候选城市' : '座城市' }}
            </p>
            <button type="button" class="text-link" :disabled="!query" @click="query = ''">
              清除搜索
            </button>
          </div>
        </template>
      </div>

      <aside class="rankings-methodology" aria-labelledby="rankings-methodology-heading">
        <h3 id="rankings-methodology-heading">统计口径</h3>
        <p>{{ activeBoard.methodology }}</p>
        <p v-if="analytics.enabled && analytics.state.value.startedAt">
          自 {{ analytics.state.value.startedAt.slice(0, 10) }} 起累计
        </p>
        <template v-if="isWishlist">
          <p class="rankings-methodology-extra">
            每点一次爱心，为这座城市承办会议加一票。你可以继续为期待的城市投票。
          </p>
          <p
            v-if="!analytics.enabled && !storageAvailable"
            class="rankings-storage-note"
            role="status"
          >
            此浏览器暂时无法保存票数，关闭页面后可能丢失。
          </p>
        </template>
        <p v-else-if="!isHeatBoard" class="rankings-methodology-extra">
          搜索后仍保留原名次。会议与年份来自本站实际收录记录。
        </p>
        <p v-if="!isHeatBoard || entries.length > 0" class="rankings-new-tab-note">
          {{ boardId === 'conference-heat' ? '会议' : '城市' }}详情均在新标签页打开。
        </p>
      </aside>

      <div class="rankings-list-content">
        <div v-if="isHeatBoard && !entries.length" class="rankings-heat-empty">
          <svg
            class="rankings-heat-symbol"
            width="68"
            height="56"
            viewBox="0 0 68 56"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path d="M9 9v38h51M22 36V25m13 11V17m13 19V9" />
            <circle cx="22" cy="25" r="3" fill="var(--color-canvas)" />
            <circle cx="35" cy="17" r="3" fill="var(--color-canvas)" />
            <circle cx="48" cy="9" r="3" fill="var(--color-canvas)" />
          </svg>
          <h3>{{ analytics.enabled ? '等待第一份关注' : '热度统计尚未开启' }}</h3>
          <p>启用后，从真实点击开始累计。先去发现感兴趣的会议和城市吧。</p>
          <div class="rankings-empty-actions">
            <router-link to="/conference" class="rankings-empty-action">浏览会议</router-link>
            <router-link to="/cities" class="text-link">探索城市</router-link>
          </div>
        </div>

        <template v-else-if="filteredEntries.length">
          <div
            class="rankings-column-headings"
            :class="{ 'has-vote': isWishlist }"
            aria-hidden="true"
          >
            <div class="rankings-column-grid">
              <span>名次</span>
              <span>{{ boardId === 'conference-heat' ? '会议 / 分类' : '城市 / 国家' }}</span>
              <span class="rankings-detail-heading">{{
                boardId === 'conference-heat'
                  ? '会议全称'
                  : `关联会议${isWishlist || isHeatBoard ? '' : ' · 年份'}`
              }}</span>
              <span class="rankings-count-heading">{{
                isWishlist ? (analytics.enabled ? '票数' : '本机') : isHeatBoard ? '点击' : '届数'
              }}</span>
              <span></span>
            </div>
            <span v-if="isWishlist" class="rankings-vote-heading">投一票</span>
          </div>

          <ul class="rankings-full-list" :aria-label="activeBoard.title">
            <li
              v-for="entry in filteredEntries"
              :key="entry.id"
              class="rankings-full-row"
              :class="{ 'has-vote': isWishlist }"
            >
              <router-link
                :to="entry.to"
                target="_blank"
                rel="noopener"
                class="rankings-row-link"
                :aria-label="`${entry.name}，${entry.subtitle}，${
                  entry.rank === null ? '未排名' : `${entry.tied ? '并列' : ''}第 ${entry.rank} 名`
                }，${entry.count ?? '待公布'} ${activeBoard.unit}，在新标签页查看${entry.cityId ? '城市' : '会议'}详情`"
              >
                <span class="rankings-row-rank" aria-hidden="true">{{ rankLabel(entry) }}</span>
                <span class="rankings-row-identity">
                  <span class="rankings-row-name">{{ entry.name }}</span>
                  <span class="rankings-row-country">{{ entry.subtitle }}</span>
                </span>
                <span class="rankings-row-detail">{{ entry.detail }}</span>
                <span class="rankings-row-count">
                  <strong>{{
                    analytics.enabled && !analytics.ready.value && isWishlist
                      ? '—'
                      : (entry.count ?? '—')
                  }}</strong>
                  <span>{{ activeBoard.unit }}</span>
                </span>
                <svg
                  class="rankings-row-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  aria-hidden="true"
                >
                  <path d="M6 18 18 6M6 6h12v12" />
                </svg>
              </router-link>
              <button
                v-if="isWishlist && entry.cityId"
                type="button"
                class="rankings-vote-button"
                :class="{ 'has-votes': getCityVotes(entry.cityId) > 0 }"
                :disabled="analytics.enabled && !analytics.ready.value"
                :aria-label="`为 ${entry.name} 承办会议投一票`"
                @click="castVote(entry)"
              >
                <svg
                  :key="votePulses[entry.id] ?? 0"
                  :class="{ 'is-voting': votePulses[entry.id] }"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  :fill="getCityVotes(entry.cityId) > 0 ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="1.6"
                  aria-hidden="true"
                >
                  <path
                    d="M20.8 5.8a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z"
                  />
                </svg>
                <span>期待 +1</span>
                <span
                  v-if="votePulses[entry.id]"
                  :key="`vote-${votePulses[entry.id]}`"
                  class="rankings-vote-plus"
                  aria-hidden="true"
                  >+1</span
                >
              </button>
            </li>
          </ul>
        </template>

        <div v-else class="rankings-search-empty">
          <h3>{{ query ? '没有找到匹配的城市' : '城市记录待补充' }}</h3>
          <p>
            {{ query ? '试试城市英文名、国家或会议缩写。' : '有了实际记录后，就能在这里查看。' }}
          </p>
          <button v-if="query" type="button" class="text-link" @click="query = ''">
            浏览完整榜单
          </button>
          <router-link v-else to="/cities" class="text-link">浏览城市</router-link>
        </div>
      </div>
    </section>
    <p class="sr-only" role="status" aria-live="polite">{{ voteMessage }}</p>
  </div>
</template>
