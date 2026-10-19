<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRankings } from '@/composables/useRankings'
import { analytics } from '@/services/analytics'

const { boards, entriesFor } = useRankings()
const index = ref(0)
const board = computed(() => boards[index.value])
const entries = computed(() =>
  entriesFor(board.value.id)
    .filter((entry) => (entry.count ?? 0) > 0)
    .slice(0, 8),
)
const maximum = computed(() => Math.max(1, ...entries.value.map((entry) => entry.count ?? 0)))
const countries = computed(() =>
  entries.value.filter(
    (entry, position, list) =>
      list.findIndex((candidate) => candidate.subtitle === entry.subtitle) === position,
  ),
)
function select(next: number) {
  index.value = (next + boards.length) % boards.length
}
</script>

<template>
  <section
    class="home-ranking home-ranking-carousel"
    aria-label="四种排行榜"
    aria-roledescription="轮播"
  >
    <div class="home-ranking-heading">
      <div>
        <h2 id="home-ranking-title">{{ board.title }}</h2>
        <p>
          {{
            board.id === 'hosting'
              ? '历史线下届次 · 前八座城市'
              : board.id === 'city-wishlist'
                ? '下一场会议，你希望在哪里举办？'
                : '从一次关注，发现下一站'
          }}
        </p>
      </div>
      <div class="home-ranking-actions">
        <router-link :to="{ name: 'rankings', query: { board: board.id } }" class="home-ranking-all"
          >榜单详情<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M7 17 17 7M7 7h10v10" /></svg
        ></router-link>
      </div>
    </div>
    <div class="home-ranking-stage" aria-live="polite" aria-atomic="true">
      <Transition name="ranking-panel" mode="out-in">
        <div :key="board.id">
          <ol v-if="entries.length" class="home-ranking-list" :aria-label="board.title">
            <li
              v-for="entry in entries"
              :key="entry.id"
              class="home-ranking-row"
              :style="{
                '--country-color':
                  entry.countryTone === undefined
                    ? 'var(--color-brand)'
                    : `var(--home-country-${entry.countryTone})`,
              }"
            >
              <router-link
                :to="entry.to"
                :target="entry.cityId ? '_blank' : undefined"
                :rel="entry.cityId ? 'noopener noreferrer' : undefined"
                :aria-label="`${entry.tied ? '并列' : ''}第 ${entry.rank}，${entry.name}，${entry.count} ${board.unit}${entry.cityId ? '；新标签页打开城市详情' : ''}`"
              >
                <span class="home-rank-position">{{ entry.tied ? '=' : '' }}{{ entry.rank }}</span>
                <span class="home-rank-city"
                  ><strong>{{ entry.name }}</strong
                  ><span>{{ entry.subtitle }}</span></span
                >
                <span class="home-rank-track" aria-hidden="true"
                  ><span :style="{ transform: `scaleX(${(entry.count ?? 0) / maximum})` }"
                /></span>
                <span class="home-rank-count"
                  >{{ entry.count }}<span class="sr-only">{{ board.unit }}</span></span
                >
              </router-link>
            </li>
          </ol>
          <div
            v-if="board.id === 'hosting' && entries.length"
            class="home-ranking-legend"
            aria-label="国家颜色图例"
          >
            <span
              v-for="entry in countries"
              :key="entry.subtitle"
              :style="{ '--country-color': `var(--home-country-${entry.countryTone})` }"
              ><i aria-hidden="true" />{{ entry.subtitle }}</span
            >
          </div>
          <div v-if="!entries.length" class="ranking-preview-empty">
            <svg
              class="ranking-empty-icon"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <template v-if="board.id === 'city-wishlist'">
                <path d="M24 37 10 24C0 14 14 3 24 15 34 3 48 14 38 24Z" />
              </template>
              <template v-else><path d="M8 37V27h8v10m4 0V18h8v19m4 0V9h8v28M5 40h38" /></template>
            </svg>
            <h3>
              {{
                board.id === 'city-wishlist'
                  ? '让期待，成为下一次相遇。'
                  : '每一次关注，都值得被看见。'
              }}
            </h3>
            <p>
              {{
                board.id === 'city-wishlist'
                  ? '为你希望承办会议的城市投一票。心有所向，就再加一票。'
                  : analytics.enabled
                    ? '从零开始，等待大家的第一份关注。点击感兴趣的会议或城市，就会留下足迹。'
                    : '热度统计尚未开启。真实点击汇聚后，这里将展示大家关注的方向。'
              }}
            </p>
            <router-link
              :to="
                board.id === 'city-wishlist'
                  ? { name: 'rankings', query: { board: board.id } }
                  : board.id === 'conference-heat'
                    ? '/conference'
                    : '/cities'
              "
              class="ranking-empty-action"
              >{{
                board.id === 'city-wishlist'
                  ? '为承办城市投一票'
                  : board.id === 'conference-heat'
                    ? '先探索会议'
                    : '先探索城市'
              }}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M7 17 17 7M7 7h10v10" /></svg
            ></router-link>
          </div>
          <p class="home-ranking-note">
            {{
              board.id === 'hosting'
                ? '基于本站收录记录，线上及未来届次不计入；同数并列。'
                : board.id === 'city-wishlist'
                  ? analytics.enabled
                    ? '全站累计期待，每次投票加一。'
                    : '当前为本机累计投票，尚未汇总全站期待。'
                  : analytics.enabled
                    ? '按主动点击累计；真实重复点击分别计数。'
                    : '尚无全站热度数据；浏览与点击暂不采集。'
            }}
          </p>
        </div>
      </Transition>
      <button
        class="ranking-side-arrow is-previous"
        type="button"
        aria-label="上一个榜单"
        @click="select(index - 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="m14 6-6 6 6 6" />
        </svg>
      </button>
      <button
        class="ranking-side-arrow is-next"
        type="button"
        aria-label="下一个榜单"
        @click="select(index + 1)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="m10 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  </section>
</template>
