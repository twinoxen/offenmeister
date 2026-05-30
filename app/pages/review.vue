<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

definePageMeta({ convexAuth: true })

const nuxtApp = useNuxtApp()
const { activePair, activePairId } = await useActivePair()

const reviewQuery = await nuxtApp.runWithContext(() =>
  useConvexQuery(api.play.getDueReviews, () => (activePairId.value ? { pairId: activePairId.value, limit: 30 } : null)),
)
const review = reviewQuery.data

const roundKey = ref(0)
const sessionCards = ref<NonNullable<typeof review.value>['cards']>([])
function startRound() {
  sessionCards.value = review.value?.cards ?? []
  roundKey.value++
}
if (review.value) startRound()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">Review</h1>
    <p class="text-slate-500">Due sentences across {{ activePair?.name }}, scheduled by spaced repetition.</p>

    <div v-if="sessionCards.length === 0" class="card mx-auto mt-8 max-w-lg p-8 text-center">
      <div class="text-4xl">🌟</div>
      <h2 class="mt-3 text-xl font-bold">Nothing due right now</h2>
      <p class="mt-1 text-slate-500">You’re all caught up. Learn new sentences to fill your review queue.</p>
      <NuxtLink to="/collections" class="btn-primary mt-5">Learn something new</NuxtLink>
    </div>

    <ClientOnly v-else>
      <PlaySession
        :key="roundKey"
        :cards="sessionCards"
        :lang-code="activePair?.target?.code ?? 'en'"
        title="Review session"
        class="mt-6"
      >
        <template #done-actions>
          <button class="btn-primary" type="button" @click="startRound">Check for more</button>
          <NuxtLink to="/dashboard" class="btn-secondary">Dashboard</NuxtLink>
        </template>
      </PlaySession>
      <template #fallback>
        <div class="card mt-6 p-8 text-center text-slate-500">Loading session…</div>
      </template>
    </ClientOnly>
  </div>
</template>
