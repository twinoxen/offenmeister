<script setup lang="ts">
import { api } from '~~/convex/_generated/api'

definePageMeta({ convexAuth: true })

const { signOut } = useConvexAuth()
// Mutations require the client-only Convex client, so create on the client only.
const updatePrefs = import.meta.client ? useConvexMutation(api.settings.updatePreferences) : null
const meQuery = await useConvexQuery(api.users.me, {})
const me = meQuery.data

const dailyGoal = ref(30)
const defaultMode = ref<'multipleChoice' | 'textInput'>('multipleChoice')
const caseSensitive = ref(false)
const accentSensitive = ref(false)
const saved = ref(false)

watchEffect(() => {
  if (me.value) {
    dailyGoal.value = me.value.dailyGoal
    defaultMode.value = me.value.defaultMode
    caseSensitive.value = me.value.caseSensitive
    accentSensitive.value = me.value.accentSensitive
  }
})

async function save() {
  await updatePrefs?.execute({
    dailyGoal: Number(dailyGoal.value),
    defaultMode: defaultMode.value,
    caseSensitive: caseSensitive.value,
    accentSensitive: accentSensitive.value,
  })
  saved.value = true
  setTimeout(() => (saved.value = false), 2000)
}

async function handleSignOut() {
  await signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <h1 class="text-2xl font-bold">Settings</h1>
    <p v-if="me" class="text-slate-500">{{ me.displayName }} · {{ me.email }}</p>

    <form class="card mt-6 space-y-6 p-6" @submit.prevent="save">
      <div>
        <label class="mb-1 block text-sm font-medium" for="goal">Daily goal (sentences)</label>
        <input id="goal" v-model.number="dailyGoal" type="number" min="5" max="500" class="input">
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium">Default play mode</label>
        <div class="flex gap-2">
          <button
type="button" class="flex-1" :class="defaultMode === 'multipleChoice' ? 'btn-primary' : 'btn-secondary'"
            @click="defaultMode = 'multipleChoice'">Multiple choice</button>
          <button
type="button" class="flex-1" :class="defaultMode === 'textInput' ? 'btn-primary' : 'btn-secondary'"
            @click="defaultMode = 'textInput'">Type the answer</button>
        </div>
      </div>

      <label class="flex items-center justify-between gap-3">
        <span>
          <span class="block text-sm font-medium">Case sensitive</span>
          <span class="text-xs text-slate-500">Require matching upper/lowercase when typing.</span>
        </span>
        <input v-model="caseSensitive" type="checkbox" class="h-5 w-5 accent-brand-600">
      </label>

      <label class="flex items-center justify-between gap-3">
        <span>
          <span class="block text-sm font-medium">Accent sensitive</span>
          <span class="text-xs text-slate-500">Require exact accents (é, ñ, ü…) when typing.</span>
        </span>
        <input v-model="accentSensitive" type="checkbox" class="h-5 w-5 accent-brand-600">
      </label>

      <div class="flex items-center gap-3">
        <button type="submit" class="btn-primary" :disabled="updatePrefs?.pending.value">Save settings</button>
        <span v-if="saved" class="text-sm text-emerald-600">Saved ✓</span>
      </div>
    </form>

    <div class="mt-6 flex items-center justify-between">
      <NuxtLink to="/languages" class="btn-secondary !text-sm">Change language</NuxtLink>
      <button class="btn-ghost !text-sm text-rose-600" type="button" @click="handleSignOut">Sign out</button>
    </div>
  </div>
</template>
