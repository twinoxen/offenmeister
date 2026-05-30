<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

definePageMeta({ convexAuth: true })

const nuxtApp = useNuxtApp()
const { activePair, activePairId } = await useActivePair()

const collectionsQuery = await nuxtApp.runWithContext(() =>
  useConvexQuery(api.collections.listForPair, () => (activePairId.value ? { pairId: activePairId.value } : null)),
)
const collections = collectionsQuery.data
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Collections</h1>
        <p class="text-slate-500">{{ activePair?.name }} — ordered by word frequency.</p>
      </div>
      <NuxtLink to="/languages" class="btn-secondary !py-2 !text-sm">Change language</NuxtLink>
    </div>

    <div v-if="collections && collections.length" class="mt-6 grid gap-4 sm:grid-cols-2">
      <CollectionCard v-for="c in collections" :key="c._id" :collection="c" />
    </div>
    <div v-else class="card mt-6 p-8 text-center text-slate-500">No collections found for this language.</div>
  </div>
</template>
