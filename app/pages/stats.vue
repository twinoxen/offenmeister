<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

definePageMeta({ convexAuth: true })

const nuxtApp = useNuxtApp()
const { activePair, activePairId } = await useActivePair()

const statsQuery = await nuxtApp.runWithContext(() =>
  useConvexQuery(api.stats.summary, () => (activePairId.value ? { pairId: activePairId.value } : null)),
)
const stats = statsQuery.data

const collectionsQuery = await nuxtApp.runWithContext(() =>
  useConvexQuery(api.collections.listForPair, () => (activePairId.value ? { pairId: activePairId.value } : null)),
)
const collections = collectionsQuery.data
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">Your progress</h1>
    <p class="text-slate-500">{{ activePair?.name }}</p>

    <template v-if="stats">
      <div class="mt-6 grid gap-4 sm:grid-cols-4">
        <StatBadge label="Points" :value="stats.points" icon="⭐" accent />
        <StatBadge label="Level" :value="stats.level" icon="🏅" />
        <StatBadge label="Current streak" :value="`${stats.dailyStreak} d`" icon="🔥" />
        <StatBadge label="Longest streak" :value="`${stats.longestStreak} d`" icon="📅" />
        <StatBadge label="Mastered" :value="stats.mastered" icon="🏆" />
        <StatBadge label="Played" :value="stats.played" icon="🎮" />
        <StatBadge label="Accuracy" :value="`${stats.accuracy}%`" icon="🎯" />
        <StatBadge label="Answered" :value="stats.totalAnswered" icon="✍️" />
      </div>

      <!-- Level progress -->
      <div class="card mt-6 p-6">
        <div class="mb-1 flex justify-between text-sm">
          <span class="font-medium">Level {{ stats.level }}</span>
          <span class="text-slate-500">{{ stats.pointsForNextLevel }} pts to level {{ stats.level + 1 }}</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div class="h-full rounded-full bg-brand-600 transition-all" :style="{ width: `${stats.percent}%` }" />
        </div>
      </div>

      <!-- Per-collection mastery -->
      <h2 class="mt-8 text-lg font-semibold">By collection</h2>
      <div class="mt-3 space-y-3">
        <div v-for="c in collections" :key="c._id" class="card p-4">
          <div class="mb-1 flex items-center justify-between text-sm">
            <NuxtLink :to="`/play/${c.slug}`" class="font-medium hover:text-brand-600">{{ c.name }}</NuxtLink>
            <span class="text-slate-500">{{ c.mastered }} / {{ c.sentenceCount }} · {{ c.due }} due</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div class="h-full rounded-full bg-brand-600 transition-all" :style="{ width: `${c.percentMastered}%` }" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
