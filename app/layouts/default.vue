<script setup lang="ts">
const { isAuthenticated, user, signOut } = useConvexAuth()
const route = useRoute()

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/collections', label: 'Collections' },
  { to: '/review', label: 'Review' },
  { to: '/stats', label: 'Stats' },
]

async function handleSignOut() {
  await signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold">
          <span class="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">Ö</span>
          <span class="text-lg tracking-tight">Offenmeister</span>
        </NuxtLink>

        <nav v-if="isAuthenticated" class="hidden items-center gap-1 sm:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            :class="route.path.startsWith(link.to) ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white' : ''"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <template v-if="isAuthenticated">
            <NuxtLink to="/settings" class="hidden text-sm text-slate-500 hover:text-slate-900 sm:inline dark:hover:text-white">
              {{ user?.name || user?.email }}
            </NuxtLink>
            <button class="btn-secondary !py-1.5 !text-xs" @click="handleSignOut">Sign out</button>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn-ghost !py-1.5 !text-sm">Sign in</NuxtLink>
            <NuxtLink to="/signup" class="btn-primary !py-1.5 !text-sm">Get started</NuxtLink>
          </template>
        </div>
      </div>

      <nav v-if="isAuthenticated" class="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden dark:border-slate-800">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300"
          :class="route.path.startsWith(link.to) ? 'bg-slate-100 dark:bg-slate-800' : ''"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
