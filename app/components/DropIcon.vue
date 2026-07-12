<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
    fill?: string
    opacity?: number
  }>(),
  { size: 20, fill: 'white', opacity: 1 }
)
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2.5c3.2 4.6 6.2 8 6.2 11.4a6.2 6.2 0 1 1-12.4 0C5.8 10.5 8.8 7.1 12 2.5z"
      :fill="fill"
      :opacity="opacity"
    />
  </svg>
</template>
