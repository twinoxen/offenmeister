<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

definePageMeta({ convexAuth: true })

const route = useRoute()
const nuxtApp = useNuxtApp()
const slug = computed(() => route.params.slug as string)

const metaQuery = await useConvexQuery(api.collections.getBySlug, () => ({ slug: slug.value }))
const meta = metaQuery.data
const collectionId = computed(() => meta.value?.collection._id ?? null)
const langCode = computed(() => meta.value?.pair?.targetCode ?? 'en')

const meQuery = await nuxtApp.runWithContext(() => useConvexQuery(api.users.me, {}))
const defaultMode = computed(() => meQuery.data.value?.defaultMode ?? 'multipleChoice')

const queueQuery = await nuxtApp.runWithContext(() =>
  useConvexQuery(api.play.getQueue, () => (collectionId.value ? { collectionId: collectionId.value, limit: 20 } : null)),
)
const queue = queueQuery.data

// Snapshot the queue per round so live updates from answering don't reshuffle
// the cards mid-session. "New round" re-snapshots the latest queue.
const roundKey = ref(0)
const sessionCards = ref<NonNullable<typeof queue.value>['cards']>([])

function startRound() {
  sessionCards.value = queue.value?.cards ?? []
  roundKey.value++
}
if (queue.value) startRound()
</script>

<template>
  <div>
    <div v-if="meta === null" class="card p-8 text-center text-slate-500">Collection not found.</div>

    <template v-else>
      <NuxtLink to="/collections" class="text-sm text-slate-500 hover:underline">← Collections</NuxtLink>

      <div v-if="sessionCards.length === 0" class="card mx-auto mt-6 max-w-lg p-8 text-center">
        <div class="text-4xl">✅</div>
        <h2 class="mt-3 text-xl font-bold">All caught up here</h2>
        <p class="mt-1 text-slate-500">No cards are due in this collection right now. Come back later or pick another collection.</p>
        <NuxtLink to="/collections" class="btn-primary mt-5">Back to collections</NuxtLink>
      </div>

      <ClientOnly v-else>
        <PlaySession
          :key="roundKey"
          :cards="sessionCards"
          :lang-code="langCode"
          :mode="defaultMode"
          :title="meta?.collection.name"
          class="mt-4"
        >
          <template #done-actions>
            <button class="btn-primary" type="button" @click="startRound">New round</button>
            <NuxtLink to="/collections" class="btn-secondary">Collections</NuxtLink>
          </template>
        </PlaySession>
        <template #fallback>
          <div class="card mt-4 p-8 text-center text-slate-500">Loading session…</div>
        </template>
      </ClientOnly>
    </template>
  </div>
</template>
