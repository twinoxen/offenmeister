<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

definePageMeta({ convexAuth: true })

// Mutations require the client-only Convex client, so create on the client only.
const setActivePair = import.meta.client ? useConvexMutation(api.settings.setActivePair) : null
const { me, pairs, activePairId } = await useActivePair()

async function choose(pairId: string) {
  await setActivePair?.execute({ pairId: pairId as never })
  await navigateTo('/collections')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">Choose a language</h1>
    <p class="mt-1 text-slate-500">Pick what you want to learn. You can switch any time.</p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="pair in pairs"
        :key="pair._id"
        type="button"
        class="card p-6 text-left transition hover:ring-2 hover:ring-brand-500/40"
        :class="pair._id === activePairId ? 'ring-2 ring-brand-500' : ''"
        @click="choose(pair._id)"
      >
        <div class="flex items-center gap-3">
          <span class="text-4xl">{{ pair.target?.flag }}</span>
          <div>
            <div class="font-semibold">{{ pair.target?.name }}</div>
            <div class="text-sm text-slate-500">from {{ pair.base?.name }}</div>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{{ pair.collectionCount }} collections · {{ pair.sentenceCount }} sentences</span>
          <span v-if="pair._id === activePairId" class="font-medium text-brand-600">Active</span>
        </div>
      </button>
    </div>

    <p v-if="me" class="mt-6 text-sm text-slate-400">Signed in as {{ me.email }}</p>
  </div>
</template>
