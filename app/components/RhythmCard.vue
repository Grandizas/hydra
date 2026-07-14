<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const { rhythm } = useReminders()
const { rhythmMode, setRhythmMode, cupSize, setCupSize } = useHydra()

const cupPresets = [200, 250, 330, 500]

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
  const amount =
    r.mode === 'cup' ? `${r.cupSize.toLocaleString()} ml each` : `~${r.perCup.toLocaleString()} ml each`
  const pace = r.mode === 'cup' ? `about every ${r.stepMin} min` : `every ${r.stepMin} min`
  return `${r.count} ${cupWord} · ${amount} · ${pace}`
})

function state(i: number) {
  if (nextIndex.value === -1 || i < nextIndex.value) return 'past'
  return i === nextIndex.value ? 'next' : 'upcoming'
}

function onCupInput(e: Event) {
  setCupSize(Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <section class="hydra-card rhythm" data-screen-label="Drinking rhythm">
    <div class="head">
      <h3 class="card-title">Today's rhythm</h3>

      <div class="mode-toggle" role="tablist">
        <button
          class="mode-btn"
          :class="{ active: rhythmMode === 'time' }"
          role="tab"
          :aria-selected="rhythmMode === 'time'"
          @click="setRhythmMode('time')"
        >
          By time
        </button>
        <button
          class="mode-btn"
          :class="{ active: rhythmMode === 'cup' }"
          role="tab"
          :aria-selected="rhythmMode === 'cup'"
          @click="setRhythmMode('cup')"
        >
          By cup size
        </button>
      </div>
    </div>

    <!-- Cup-size picker (only in 'cup' mode) -->
    <Transition name="cup-fade">
      <div v-if="rhythmMode === 'cup'" class="cup-picker">
        <span class="cup-picker-label">My cup</span>
        <div class="cup-presets">
          <button
            v-for="p in cupPresets"
            :key="p"
            class="cup-preset"
            :class="{ active: cupSize === p }"
            @click="setCupSize(p)"
          >
            {{ p }} ml
          </button>
        </div>
        <div class="cup-custom">
          <input
            type="number"
            min="50"
            max="1000"
            step="10"
            :value="cupSize"
            @change="onCupInput"
          />
          <span>ml</span>
        </div>
      </div>
    </Transition>

    <div class="summary-line">{{ summary }}</div>

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
      A gentle guide — sip whenever it suits you. Reminders follow this plan.
    </p>
  </section>
</template>

<style scoped>
.rhythm {
  margin-top: 22px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.mode-toggle {
  display: inline-flex;
  padding: 3px;
  border-radius: 12px;
  background: rgba(232, 242, 251, 0.9);
  border: 1px solid rgba(200, 224, 242, 0.7);
}
.mode-btn {
  border: none;
  background: transparent;
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  color: #6b8398;
  cursor: pointer;
  transition: all 0.18s ease;
}
.mode-btn:hover {
  color: #1e8fdd;
}
.mode-btn.active {
  background: white;
  color: #146fae;
  box-shadow: 0 2px 8px rgba(30, 110, 170, 0.12);
}

.cup-picker {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(240, 248, 254, 0.8);
  border: 1px solid rgba(200, 224, 242, 0.7);
}
.cup-picker-label {
  font-size: 12px;
  font-weight: 700;
  color: #7d94a8;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.cup-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cup-preset {
  padding: 8px 14px;
  border-radius: 12px;
  border: 1px solid rgba(170, 205, 232, 0.6);
  background: white;
  font-size: 13.5px;
  font-weight: 700;
  color: #4a6b84;
  cursor: pointer;
  transition: all 0.16s ease;
}
.cup-preset:hover {
  border-color: rgba(30, 143, 221, 0.5);
  color: #1e8fdd;
}
.cup-preset.active {
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  color: white;
  border-color: transparent;
}
.cup-custom {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #6b8398;
  margin-left: auto;
}
.cup-custom input {
  width: 68px;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(170, 205, 232, 0.7);
  background: white;
  font-size: 14px;
  font-weight: 700;
  color: #10293a;
  outline: none;
}
.cup-custom input:focus {
  border-color: #1e8fdd;
}

.summary-line {
  margin-top: 16px;
  font-size: 13px;
  font-weight: 600;
  color: #6b8398;
}

.track {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  margin-top: 16px;
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

.cup.past {
  opacity: 0.45;
}
.cup.past .cup-dot {
  background: rgba(76, 195, 247, 0.55);
}
.cup.upcoming .cup-dot {
  background: linear-gradient(160deg, #7dd3f7, #3ba0e6);
}
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

.cup-fade-enter-active {
  animation: fadeUp 0.28s ease;
}
</style>
