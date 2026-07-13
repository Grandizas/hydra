// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // localStorage-driven client dashboard — render on the client to avoid
  // Date/localStorage hydration mismatches.
  ssr: false,

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Hydra',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        // The file is a PNG; the ?v= query busts the browser's sticky favicon cache.
        { rel: 'icon', type: 'image/png', href: '/favicon.ico?v=2' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
        }
      ]
    }
  }
})
