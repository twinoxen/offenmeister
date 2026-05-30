<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

definePageMeta({ convexAuth: true })

const nuxtApp = useNuxtApp()
const { me, pairs, activePairId, activePair } = await useActivePair()

const statsQuery = await nuxtApp.runWithContext(() =>
  useConvexQuery(api.stats.summary, () => (activePairId.value ? { pairId: activePairId.value } : null)),
)
const stats = statsQuery.data
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Hi{{ me?.displayName ? `, ${me.displayName}` : '' }} 👋</h1>
        <p class="text-slate-500">
          <template v-if="activePair">Studying <span class="font-medium">{{ activePair.name }}</span></template>
          <template v-else>Pick a language to begin.</template>
        </p>
      </div>
      <NuxtLink to="/languages" class="btn-secondary !py-2 !text-sm">Change language</NuxtLink>
    </div>

    <!-- No language pairs seeded -->
    <div v-if="!pairs || pairs.length === 0" class="card mt-8 p-8 text-center text-slate-500">
      No content found yet. Run <code class="rounded bg-slate-100 px-1 dark:bg-slate-800">npx convex run seed:run</code> to load the starter sentences.
    </div>

    <template v-else-if="stats">
      <!-- Daily goal + headline stats -->
      <div class="mt-8 grid gap-4 sm:grid-cols-3">
        <div class="card flex items-center gap-5 p-6 sm:col-span-1">
          <ProgressRing
:percent="stats.goalPercent" :size="110"
            :label="`${stats.playedToday}/${stats.dailyGoal}`" sub="today" />
          <div>
            <div class="font-semibold">Daily goal</div>
            <p class="text-sm text-slate-500">
              {{ stats.playedToday >= stats.dailyGoal ? 'Goal reached — nice!' : `${stats.dailyGoal - stats.playedToday} to go` }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 sm:col-span-2">
          <StatBadge label="Points" :value="stats.points" icon="⭐" accent />
          <StatBadge label="Level" :value="stats.level" icon="🏅" />
          <StatBadge label="Day streak" :value="stats.dailyStreak" icon="🔥" />
          <StatBadge label="Accuracy" :value="`${stats.accuracy}%`" icon="🎯" />
        </div>
      </div>

      <!-- Continue / review -->
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <NuxtLink to="/collections" class="card flex items-center justify-between p-6 transition hover:ring-2 hover:ring-brand-500/40">
          <div>
            <div class="font-semibold">Keep learning</div>
            <p class="text-sm text-slate-500">{{ stats.mastered }} of {{ stats.totalSentences }} sentences mastered</p>
          </div>
          <span class="text-2xl">→</span>
        </NuxtLink>
        <NuxtLink
to="/review" class="card flex items-center justify-between p-6 transition hover:ring-2 hover:ring-brand-500/40"
          :class="stats.due > 0 ? 'ring-2 ring-amber-400/50' : ''">
          <div>
            <div class="font-semibold">Review</div>
            <p class="text-sm text-slate-500">
              {{ stats.due > 0 ? `${stats.due} due right now` : 'Nothing due — you’re caught up' }}
            </p>
          </div>
          <span class="text-2xl">🔁</span>
        </NuxtLink>
      </div>

      <div class="mt-6">
        <div class="mb-1 flex justify-between text-sm text-slate-500">
          <span>Overall mastery</span><span>{{ stats.completionPercent }}%</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div class="h-full rounded-full bg-brand-600 transition-all" :style="{ width: `${stats.completionPercent}%` }" />
        </div>
      </div>
    </template>
  </div>
</template>
