<script setup lang="ts">
const { signUp, refreshAuth, isAuthenticated } = useConvexAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

watchEffect(() => {
  if (isAuthenticated.value) navigateTo('/dashboard')
})

async function onSubmit() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  loading.value = true
  try {
    const res = await signUp.email({ name: name.value, email: email.value, password: password.value })
    if (res && 'error' in res && res.error) {
      error.value = res.error.message ?? 'Could not create account.'
      return
    }
    await refreshAuth()
    await navigateTo('/languages')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm pt-8">
    <h1 class="text-2xl font-bold">Create your account</h1>
    <p class="mt-1 text-sm text-slate-500">Start filling in the blanks in minutes.</p>

    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-1 block text-sm font-medium" for="name">Name</label>
        <input id="name" v-model="name" type="text" required autocomplete="name" class="input" placeholder="Alex">
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="email" class="input" placeholder="you@example.com">
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium" for="password">Password</label>
        <input id="password" v-model="password" type="password" required autocomplete="new-password" class="input" placeholder="At least 8 characters">
      </div>
      <p v-if="error" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="loading">{{ loading ? 'Creating…' : 'Create account' }}</button>
    </form>

    <p class="mt-4 text-center text-sm text-slate-500">
      Already have an account? <NuxtLink to="/login" class="font-medium text-brand-600 hover:underline">Sign in</NuxtLink>
    </p>
  </div>
</template>
