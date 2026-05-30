// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['better-convex-nuxt', '@nuxtjs/tailwindcss', '@nuxt/eslint'],

  css: ['~/assets/css/tailwind.css'],

  convex: {
    url: process.env.CONVEX_URL,
    // Auth (Better Auth running inside Convex) is enabled by default.
    auth: {
      routeProtection: {
        // Pages using `definePageMeta({ convexAuth: true })` redirect here when signed out.
        redirectTo: '/login',
        preserveReturnTo: true,
      },
    },
    // Marketing / auth pages that never require a session.
    publicRoutes: ['/', '/login', '/signup'],
  },

  app: {
    head: {
      title: 'Offenmeister — learn languages in context',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Offenmeister helps you learn languages by filling in the blank — real sentences, spaced repetition, and frequency-ordered collections.',
        },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  typescript: {
    strict: true,
  },
})
