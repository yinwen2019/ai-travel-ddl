<script setup lang="ts">
import { computed } from 'vue'
import type { CityLinkProps } from '@/types/location'
import { useCityDirectory } from '@/composables/useCityDirectory'

const props = withDefaults(defineProps<CityLinkProps>(), { includeCountry: false })
const { findCity } = useCityDirectory()
const destination = computed(() => findCity(props.city, props.country))
const label = computed(() =>
  props.includeCountry
    ? `${props.city || '待公布'}, ${props.country || '待公布'}`
    : props.city || '待公布',
)
</script>

<template>
  <router-link
    v-if="destination"
    :to="{ name: 'city', params: { id: destination.id } }"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`${label}，在新标签页查看城市`"
    class="text-link"
    ><slot>{{ label }}</slot></router-link
  >
  <span v-else
    ><slot>{{ label }}</slot></span
  >
</template>
