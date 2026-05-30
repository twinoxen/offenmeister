<script setup lang="ts">
const { signIn, refreshAuth, isAuthenticated } = useConvexAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

watchEffect(() => {
  if (isAuthenticated.value) navigateTo('/dashboard')
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await signIn.email({ email: email.value, password: password.value })
    if (res && 'error' in res && res.error) {
      error.value = res.error.message ?? 'Could not sign in.'
      return
    }
    await refreshAuth()
    await navigateTo('/dashboard')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm pt-8">
    <h1 class="text-2xl font-bold">Welcome back</h1>
    <p class="mt-1 text-sm text-slate-500">Sign in to keep your streak going.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium" for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="email" class="input" placeholder="you@example.com">
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="password">Password</label>
        <input id="password" v-model="password" type="password" required autocomplete="current-password" class="input" placeholder="••••••••">
      </div>
      <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
    </form>

    <p class="mt-4 text-center text-sm text-slate-500">
      No account? <NuxtLink to="/signup" class="font-medium text-brand-600 hover:underline">Create one</NuxtLink>
    </p>
  </div>
</template>
