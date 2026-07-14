<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const { total, goalReached, addAmount, remindersOn } = useHydra()
const { rhythm } = useReminders()

// A cup only counts as "missed" once it's been due for a little while, so the
// banner doesn't pop the instant a slot arrives (the reminder already did that).
const GRACE_MIN = 10

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

const repCup = computed(() => {
  const cups = rhythm.value.cups
  if (!cups.length) return 250
  return rhythm.value.perCup || cups[0].ml || 250
})

// How much the plan expects you to have had by now, vs. what you've logged.
const expectedByNow = computed(() => {
  const due = nowMin.value - GRACE_MIN
  return rhythm.value.cups.filter((c) => c.min <= due).reduce((s, c) => s + c.ml, 0)
})
const deficit = computed(() => Math.max(0, expectedByNow.value - total.value))
const cupsBehind = computed(() => (repCup.value ? Math.round(deficit.value / repCup.value) : 0))
const deficitLabel = computed(() => (Math.round(deficit.value / 10) * 10).toLocaleString())

const behindLabel = computed(() => {
  if (cupsBehind.value <= 1) return 'about 1 cup behind your rhythm'
  if (cupsBehind.value === 2) return 'about 2 cups behind your rhythm'
  return 'a few cups behind your rhythm'
})

// Dismiss hides it until you slip further behind; catching up fully resets it.
const dismissedAt = ref(0)
watch(cupsBehind, (v) => {
  if (v === 0) dismissedAt.value = 0
})

const visible = computed(
  () =>
    remindersOn.value &&
    !goalReached.value &&
    rhythm.value.cups.length > 0 &&
    cupsBehind.value >= 1 &&
    cupsBehind.value > dismissedAt.value
)

function logCup() {
  addAmount(repCup.value)
}
function dismiss() {
  dismissedAt.value = cupsBehind.value
}
</script>

<template>
  <Transition name="banner">
    <div v-if="visible" class="missed" role="status" aria-live="polite">
      <div class="icon-wrap">
        <span class="icon">💧</span>
        <span class="ring" />
      </div>
      <div class="body">
        <div class="title">You're {{ behindLabel }}</div>
        <div class="sub">
          Roughly {{ deficitLabel }} ml to catch up — a quick sip and you're back on track.
        </div>
      </div>
      <button class="log" @click="logCup">Log {{ repCup }} ml</button>
      <button class="close" aria-label="Dismiss" @click="dismiss">×</button>
    </div>
  </Transition>
</template>

<style scoped>
.missed {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  padding: 16px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 247, 235, 0.95), rgba(255, 240, 222, 0.85));
  border: 1px solid rgba(224, 160, 90, 0.35);
  box-shadow: 0 12px 30px rgba(196, 130, 60, 0.12);
  backdrop-filter: blur(8px);
}

.icon-wrap {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon {
  font-size: 22px;
  line-height: 1;
  z-index: 1;
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 176, 96, 0.35), rgba(244, 176, 96, 0));
  animation: glowPulse 2.4s ease-in-out infinite;
}

.body {
  flex: 1;
  min-width: 0;
}
.title {
  font-size: 15px;
  font-weight: 700;
  color: #7a4d17;
}
.sub {
  font-size: 13px;
  color: #9a7443;
  margin-top: 2px;
  line-height: 1.4;
}

.log {
  flex-shrink: 0;
  padding: 11px 18px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(30, 143, 221, 0.26);
  transition: filter 0.15s ease, transform 0.1s ease;
}
.log:hover {
  filter: brightness(1.06);
}
.log:active {
  transform: scale(0.97);
}

.close {
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: rgba(122, 77, 23, 0.55);
  font-size: 20px;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.close:hover {
  color: #7a4d17;
  background: rgba(224, 160, 90, 0.14);
}

.banner-enter-active {
  animation: fadeUp 0.4s ease;
}
.banner-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 560px) {
  .missed {
    flex-wrap: wrap;
  }
  .log {
    order: 3;
  }
}
</style>
