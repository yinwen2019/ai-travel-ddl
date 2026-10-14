<script setup lang="ts">
defineProps<{
  message: string
  variant?: 'empty' | 'no-results'
}>()

defineEmits<{
  clear: []
}>()
</script>

<template>
  <div class="empty-state">
    <svg
      class="mx-auto"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.3"
      aria-hidden="true"
    >
      <path d="M4 7h16v13H4zM8 7V4h8v3M9 13h6" />
    </svg>
    <p>{{ message }}</p>
    <slot
      ><button v-if="variant === 'no-results'" class="control-button" @click="$emit('clear')">
        清除筛选条件
      </button></slot
    >
  </div>
</template>
