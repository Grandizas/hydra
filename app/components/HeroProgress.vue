<script setup lang="ts">
import { ref } from 'vue'

const {
  displayMlLabel,
  goalLabel,
  journeyText,
  journeyKey,
  goalReached,
  goal,
  setGoal,
  goalMin,
  goalMax,
  goalStep
} = useHydra()

const editing = ref(false)
const presets = [2000, 2500, 3000, 3500]

function onSlide(e: Event) {
  setGoal(Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <section class="hero" data-screen-label="Today progress">
    <WaterGlass />

    <div class="hero-right">
      <div>
        <div class="section-label">Today</div>
        <div class="today-amount">
          <span class="today-big">{{ displayMlLabel }}</span>
          <button
            class="today-goal"
            :aria-expanded="editing"
            title="Adjust your daily goal"
            @click="editing = !editing"
          >
            / {{ goalLabel }} ml
            <svg class="edit-icon" width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <Transition name="goal-fade">
          <div v-if="editing" class="goal-editor">
            <div class="goal-editor-head">
              <span class="goal-editor-label">Daily goal</span>
              <span class="goal-editor-value">{{ goalLabel }} ml</span>
            </div>
            <input
              class="goal-range"
              type="range"
              :min="goalMin"
              :max="goalMax"
              :step="goalStep"
              :value="goal"
              @input="onSlide"
            />
            <div class="goal-presets">
              <button
                v-for="p in presets"
                :key="p"
                class="goal-preset"
                :class="{ active: goal === p }"
                @click="setGoal(p)"
              >
                {{ p / 1000 }}L
              </button>
            </div>
          </div>
        </Transition>

        <div class="journey">
          <Transition name="journey" mode="out-in">
            <span :key="journeyKey" class="journey-text" :class="{ done: goalReached }">
              {{ journeyText }}
            </span>
          </Transition>
        </div>
      </div>

      <QuickAdd />
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  box-shadow: 0 20px 50px rgba(30, 110, 170, 0.09);
  padding: 36px 40px;
  display: flex;
  gap: 48px;
  align-items: center;
  flex-wrap: wrap;
}
.hero-right {
  flex: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b8398;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.today-amount {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 6px;
}
.today-big {
  font-size: 52px;
  font-weight: 800;
  letter-spacing: -0.035em;
  background: linear-gradient(120deg, #1e8fdd, #22b8e6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.today-goal {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  padding: 3px 6px;
  margin-left: -2px;
  border-radius: 10px;
  font-size: 19px;
  font-weight: 600;
  color: #8aa2b5;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease;
}
.today-goal:hover {
  color: #1e8fdd;
  background: rgba(76, 195, 247, 0.1);
}
.edit-icon {
  opacity: 0.5;
  transition: opacity 0.18s ease;
}
.today-goal:hover .edit-icon {
  opacity: 1;
}

.goal-editor {
  margin-top: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(240, 248, 254, 0.85);
  border: 1px solid rgba(200, 224, 242, 0.7);
  max-width: 340px;
}
.goal-editor-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.goal-editor-label {
  font-size: 12px;
  font-weight: 600;
  color: #7d94a8;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.goal-editor-value {
  font-size: 15px;
  font-weight: 700;
  color: #146fae;
}
.goal-range {
  width: 100%;
  accent-color: #1e8fdd;
  cursor: pointer;
}
.goal-presets {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.goal-preset {
  flex: 1;
  padding: 8px 0;
  border-radius: 12px;
  border: 1px solid rgba(170, 205, 232, 0.6);
  background: white;
  font-size: 13.5px;
  font-weight: 700;
  color: #4a6b84;
  cursor: pointer;
  transition: all 0.16s ease;
}
.goal-preset:hover {
  border-color: rgba(30, 143, 221, 0.5);
  color: #1e8fdd;
}
.goal-preset.active {
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  color: white;
  border-color: transparent;
}

.goal-fade-enter-active {
  animation: fadeUp 0.28s ease;
}

.journey {
  margin-top: 12px;
  min-height: 24px;
}
.journey-text {
  font-size: 15px;
  font-weight: 500;
  color: #4a6b84;
  display: inline-block;
}
.journey-text.done {
  color: #189a6c;
}
.journey-enter-active {
  animation: fadeUp 0.5s ease;
}
</style>
