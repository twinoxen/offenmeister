<script setup lang="ts">
defineProps<{ label: string; value: string | number; icon?: string; accent?: boolean }>()
</script>

<template>
  <div class="card flex items-center gap-3 p-4">
    <div
      class="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
      :class="accent ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800'"
    >
      {{ icon ?? '•' }}
    </div>
    <div class="min-w-0">
      <div class="text-xl font-bold leading-tight">{{ value }}</div>
      <div class="truncate text-xs text-slate-500">{{ label }}</div>
    </div>
  </div>
</template>
