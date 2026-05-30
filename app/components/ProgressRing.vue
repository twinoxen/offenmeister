<script setup lang="ts">
const props = withDefaults(
  defineProps<{ percent: number; size?: number; stroke?: number; label?: string; sub?: string }>(),
  { size: 120, stroke: 10 },
)

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value * (1 - Math.min(100, Math.max(0, props.percent)) / 100))
</script>

<template>
  <div class="relative grid place-items-center" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" class="-rotate-90">
      <circle
        :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="stroke" fill="none"
        class="stroke-slate-200 dark:stroke-slate-800"
      />
      <circle
        :cx="size / 2" :cy="size / 2" :r="radius" :stroke-width="stroke" fill="none" stroke-linecap="round"
        class="stroke-brand-600 transition-[stroke-dashoffset] duration-500"
        :stroke-dasharray="circumference" :stroke-dashoffset="offset"
      />
    </svg>
    <div class="absolute text-center">
      <div class="text-2xl font-bold">{{ label ?? `${Math.round(percent)}%` }}</div>
      <div v-if="sub" class="text-xs text-slate-500">{{ sub }}</div>
    </div>
  </div>
</template>
