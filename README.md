# Hydra 💧

A calm, single-page hydration dashboard. Log your water, watch a glass fill in real time, and get gentle reminders on a rhythm that fits your day — all stored locally in your browser, no account required.

Built with **Nuxt 4** + **Vue 3** and deployed on **Vercel**.

## Features

- **Animated glass** — a live water-fill visualization with your progress toward the daily goal.
- **Quick add** — one-tap `+100 / +250 / +500 / +750 ml` buttons, plus a custom amount.
- **Editable daily goal** — tap the goal in the hero to adjust it (slider + presets, 1,000–5,000 ml). Everything downstream (%, stats, feel, achievements) recalculates.
- **Today's rhythm** — a recommended cup-by-cup plan, in two modes:
  - **By time** — spreads the goal across your schedule slots (e.g. _9 cups · ~280 ml each_).
  - **By cup size** — you set your cup (e.g. 250 ml) and it fits the cups evenly across your window (e.g. _10 cups · 250 ml each_).
  The upcoming cup is highlighted; past cups fade.
- **Browser notifications** — reminders fire at clock-aligned slots within an active window. Choose _Every 45 min_, _Morning only_, _Work hours_, or a **custom schedule** (minute-level start/end + interval). Drinking during a slot skips that reminder; reminders stop once you hit your goal.
- **Timeline, insights, weekly chart, and achievements** — derived automatically from the day's entries.
- **Persistence** — the day's log, goal, and preferences are saved to `localStorage`; the log resets each day.
- **Vercel Web Analytics** — privacy-friendly page-view analytics in production.

## Tech stack

- [Nuxt 4](https://nuxt.com/) (SPA mode — `ssr: false`)
- [Vue 3](https://vuejs.org/) `<script setup>` + TypeScript
- Scoped CSS (no UI framework)
- [`@vercel/analytics`](https://vercel.com/docs/analytics)

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

> **Note:** the project uses an `.npmrc` with `legacy-peer-deps=true` to resolve an optional peer-dependency mismatch between `@vercel/analytics` (expects `vue-router@4`) and Nuxt 4 (ships `vue-router@5`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run generate` | Static/prerendered build |

## Project structure

```
app/
├─ app.vue                     # Root — composes the dashboard sections
├─ assets/css/main.css         # Global styles, gradient background, keyframes, shared card style
├─ components/
│  ├─ AppHeader.vue            # Logo, date, "hydrated" pill
│  ├─ HeroProgress.vue         # Big total + editable goal + quick add
│  ├─ WaterGlass.vue           # Animated glass visualization
│  ├─ QuickAdd.vue             # Quick-add & custom-amount buttons
│  ├─ RhythmCard.vue           # Recommended drinking rhythm (by time / by cup)
│  ├─ FeelCard.vue             # "How you might feel" at current hydration
│  ├─ TimelineCard.vue         # Today's log
│  ├─ RemindersCard.vue        # Notification toggle + schedule picker
│  ├─ AnalyticsCard.vue        # Weekly chart + stat chips
│  ├─ InsightsCard.vue         # Contextual insights
│  ├─ AchievementsCard.vue     # Badges
│  └─ DropIcon.vue             # Reusable water-drop SVG
├─ composables/
│  ├─ useHydra.ts              # Core state: entries, goal, rhythm prefs, persistence, derived values
│  └─ useReminders.ts          # Notification permission + scheduler + rhythm computation
└─ plugins/
   └─ vercel-analytics.client.ts  # Injects Vercel Web Analytics (client only)
```

State lives in two composables backed by Nuxt `useState`; components stay presentational and pull only what they need.

## Notifications

Reminders use the browser **Notifications API** and fire **only while a Hydra tab is open** (no service worker / background push yet). To receive them:

1. Toggle reminders on and click **Enable notifications** (grant permission).
2. Make sure your OS/browser allows notifications (e.g. Windows Focus Assist off).
3. Use **Send a test** to confirm delivery.

## Data & privacy

All hydration data stays in your browser's `localStorage` (keys `hydra:v1` and `hydra:lastReminder`) — nothing is sent to a server. Vercel Web Analytics collects anonymous page-view metrics in production only.

## Deployment (Vercel)

Nuxt deploys to Vercel with zero config (the Nitro Vercel preset is auto-detected).

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new) (framework auto-detected as Nuxt.js — keep defaults).
2. Enable **Web Analytics** in the project's **Analytics** tab to start collecting data.

Analytics runs in debug mode locally (logs to the console, sends nothing) and reports real page views once deployed.
