<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ search: [query: string] }>()
const localQuery = ref(model.value)
let timer: ReturnType<typeof setTimeout> | undefined
watch(model, (value) => {
  if (value !== localQuery.value) {
    clearTimeout(timer)
    localQuery.value = value
  }
})
function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  localQuery.value = value
  clearTimeout(timer)
  timer = setTimeout(() => {
    model.value = value
    emit('search', value)
  }, 200)
}
function clear() {
  clearTimeout(timer)
  localQuery.value = ''
  model.value = ''
  emit('search', '')
}
onBeforeUnmount(() => clearTimeout(timer))
</script>
<template>
  <div class="search-input">
    <svg
      class="search-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </svg>
    <input
      :value="localQuery"
      type="search"
      aria-label="搜索会议名称、全称或分类"
      placeholder="搜索会议…"
      @input="onInput"
    />
    <button v-if="localQuery" class="search-clear" aria-label="清除搜索" @click="clear">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path d="m6 6 12 12M6 18 18 6" />
      </svg>
    </button>
  </div>
</template>
<style scoped>
input::-webkit-search-cancel-button {
  display: none;
}
</style>
