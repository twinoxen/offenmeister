<script setup lang="ts">
const { isAuthenticated } = useConvexAuth()

const features = [
  { icon: '📝', title: 'Learn in context', body: 'Every word appears inside a real sentence — fill in the blank to lock it into memory.' },
  { icon: '🔁', title: 'Spaced repetition', body: 'Sentences come back right before you’d forget them. The schedule adapts to you.' },
  { icon: '📈', title: 'Frequency first', body: 'Collections are ordered by how common the missing word is, so you learn what matters most.' },
  { icon: '✨', title: 'AI explanations', body: 'Stuck? Get an on-demand grammar breakdown, a hint, and a fresh example sentence.' },
]
</script>

<template>
  <div>
    <section class="mx-auto max-w-3xl pt-8 text-center sm:pt-16">
      <span class="inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
        Learn languages in context
      </span>
      <h1 class="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl">
        Fill in the blank.<br>Build real fluency.
      </h1>
      <p class="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
        Offenmeister teaches vocabulary through cloze sentences — real language, one missing
        word at a time — with spaced repetition that keeps it stuck.
      </p>
      <div class="mt-8 flex justify-center gap-3">
        <NuxtLink :to="isAuthenticated ? '/dashboard' : '/signup'" class="btn-primary !px-6 !py-3 !text-base">
          {{ isAuthenticated ? 'Go to dashboard' : 'Start learning — free' }}
        </NuxtLink>
        <NuxtLink to="/login" class="btn-secondary !px-6 !py-3 !text-base">Sign in</NuxtLink>
      </div>
    </section>

    <!-- Sample card -->
    <section class="mx-auto mt-14 max-w-xl">
      <div class="card p-6 sm:p-8">
        <p class="text-xs uppercase tracking-wide text-slate-400">Spanish from English</p>
        <p class="mt-3 text-2xl font-medium sm:text-3xl">
          ¿Dónde <span class="rounded bg-brand-100 px-2 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">____</span> el baño?
        </p>
        <p class="mt-2 text-slate-500">Where is the bathroom?</p>
        <div class="mt-5 grid grid-cols-2 gap-2">
          <div class="btn bg-emerald-600 text-white">está</div>
          <div class="btn-secondary">es</div>
          <div class="btn-secondary">son</div>
          <div class="btn-secondary">estoy</div>
        </div>
      </div>
    </section>

    <section class="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
      <div v-for="f in features" :key="f.title" class="card p-6">
        <div class="text-3xl">{{ f.icon }}</div>
        <h3 class="mt-3 font-semibold">{{ f.title }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ f.body }}</p>
      </div>
    </section>
  </div>
</template>
