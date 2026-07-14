import { inject } from '@vercel/analytics'

// Vercel Web Analytics. This app has no `pages/` router, so we inject the
// framework-agnostic tracker directly instead of using @vercel/analytics/nuxt
// (whose route-change tracking assumes a Vue Router is present).
//
// Only sends data in production on Vercel; locally it runs in debug mode and
// logs to the console. Enable Web Analytics in the Vercel project dashboard.
export default defineNuxtPlugin(() => {
  inject({ mode: 'auto' })
})
