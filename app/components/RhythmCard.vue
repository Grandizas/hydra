<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const { rhythm } = useReminders()

const nowMin = ref(minutesNow())
let timer: ReturnType<typeof setInterval> | null = null

function minutesNow() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

onMounted(() => {
  timer = setInterval(() => (nowMin.value = minutesNow()), 30_000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// Index of the next upcoming cup (-1 once the day's plan is done).
const nextIndex = computed(() => rhythm.value.cups.findIndex((c) => c.min >= nowMin.value))

const summary = computed(() => {
  const r = rhythm.value
  if (!r.count) return ''
  const cupWord = r.count === 1 ? 'cup' : 'cups'
  return `${r.count} ${cupWord} · ~${r.perCup.toLocaleString()} ml each · every ${r.interval} min`
})

function state(i: number) {
  if (nextIndex.value === -1) return 'past'
  if (i < nextIndex.value) return 'past'
  if (i === nextIndex.value) return 'next'
  return 'upcoming'
}
</script>

<template>
  <section class="hydra-card rhythm" data-screen-label="Drinking rhythm">
    <div class="head">
      <h3 class="card-title">Today's rhythm</h3>
      <span v-if="summary" class="summary">{{ summary }}</span>
    </div>

    <div v-if="rhythm.count" class="track">
      <div v-for="(c, i) in rhythm.cups" :key="c.min" class="cup" :class="state(i)">
        <span class="cup-ml">{{ c.ml }} ml</span>
        <span class="cup-dot" />
        <span class="cup-time">{{ c.time }}</span>
        <span v-if="state(i) === 'next'" class="cup-tag">next</span>
      </div>
    </div>
    <p v-else class="card-footnote">
      Set a valid reminder window to see your suggested drinking rhythm.
    </p>

    <p v-if="rhythm.count" class="card-footnote">
      A gentle guide — sip whenever it suits you. Amounts scale with your goal and schedule.
    </p>
  </section>
</template>

<style scoped>
.rhythm {
  margin-top: 22px;
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.summary {
  font-size: 13px;
  font-weight: 600;
  color: #6b8398;
}

.track {
  display: flex;
  gap: 10px;
  margin-top: 22px;
  padding-bottom: 6px;
  overflow-x: auto;
}

.cup {
  position: relative;
  flex: 1 0 auto;
  min-width: 74px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  padding: 14px 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(200, 224, 242, 0.6);
  background: rgba(248, 251, 254, 0.75);
  transition: all 0.25s ease;
}
.cup-ml {
  font-size: 13px;
  font-weight: 700;
  color: #1c3a52;
}
.cup-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(180, 205, 228, 0.9);
  transition: all 0.25s ease;
}
.cup-time {
  font-size: 12.5px;
  font-weight: 600;
  color: #6b8398;
}
.cup-tag {
  position: absolute;
  top: -9px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: white;
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  padding: 2px 8px;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(30, 143, 221, 0.3);
}

/* Past cups: softened */
.cup.past {
  opacity: 0.45;
}
.cup.past .cup-dot {
  background: rgba(76, 195, 247, 0.55);
}

/* Upcoming cups: gentle blue dot */
.cup.upcoming .cup-dot {
  background: linear-gradient(160deg, #7dd3f7, #3ba0e6);
}

/* Next cup: highlighted */
.cup.next {
  border-color: rgba(30, 143, 221, 0.55);
  background: linear-gradient(150deg, rgba(76, 195, 247, 0.16), rgba(30, 143, 221, 0.09));
  box-shadow: 0 10px 24px rgba(30, 143, 221, 0.14);
}
.cup.next .cup-ml {
  color: #146fae;
}
.cup.next .cup-dot {
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  box-shadow: 0 0 0 5px rgba(76, 195, 247, 0.18);
  animation: glowPulse 2.4s ease-in-out infinite;
}
.cup.next .cup-time {
  color: #146fae;
}
</style>
