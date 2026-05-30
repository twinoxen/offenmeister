<script setup lang="ts">
defineProps<{
  collection: {
    slug: string
    name: string
    description: string
    sentenceCount: number
    played: number
    mastered: number
    due: number
    percentMastered: number
  }
}>()
</script>

<template>
  <NuxtLink :to="`/play/${collection.slug}`" class="card group block p-5 transition hover:shadow-md hover:ring-2 hover:ring-brand-500/40">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-semibold group-hover:text-brand-700 dark:group-hover:text-brand-300">{{ collection.name }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ collection.description }}</p>
      </div>
      <span
        v-if="collection.due > 0"
        class="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      >
        {{ collection.due }} due
      </span>
    </div>

    <div class="mt-4">
      <div class="mb-1 flex justify-between text-xs text-slate-500">
        <span>{{ collection.mastered }} / {{ collection.sentenceCount }} mastered</span>
        <span>{{ collection.percentMastered }}%</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div class="h-full rounded-full bg-brand-600 transition-all" :style="{ width: `${collection.percentMastered}%` }" />
      </div>
    </div>
  </NuxtLink>
</template>
