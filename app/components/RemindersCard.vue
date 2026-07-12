<script setup lang="ts">
const { remindersOn, toggleReminders, reminderOptions, pickReminder } = useHydra()
</script>

<template>
  <section class="hydra-card" data-screen-label="Reminders">
    <div class="head">
      <h3 class="card-title">Reminders</h3>
      <button
        class="switch"
        :class="{ on: remindersOn }"
        :aria-pressed="remindersOn"
        @click="toggleReminders"
      >
        <span class="knob" />
      </button>
    </div>

    <div
      class="options"
      :style="{ opacity: remindersOn ? 1 : 0.4, pointerEvents: remindersOn ? 'auto' : 'none' }"
    >
      <button
        v-for="ro in reminderOptions"
        :key="ro.label"
        class="option"
        :style="{ border: `1px solid ${ro.border}`, background: ro.bg, color: ro.color }"
        @click="pickReminder(ro.label)"
      >
        {{ ro.label }}
        <span class="sub" :style="{ color: ro.subColor }">{{ ro.sub }}</span>
      </button>
    </div>

    <p class="card-footnote">Gentle nudges with encouraging words — never guilt.</p>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.switch {
  width: 46px;
  height: 27px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.25s ease;
  background: rgba(200, 216, 230, 0.9);
  padding: 0;
}
.switch.on {
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
}
.knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 6px rgba(20, 60, 90, 0.2);
  transition: left 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.switch.on .knob {
  left: 22px;
}

.options {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  transition: opacity 0.3s ease;
}
.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px;
  border-radius: 16px;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.18s ease;
}
.option:hover {
  border-color: rgba(30, 143, 221, 0.5) !important;
}
.sub {
  font-size: 12px;
  font-weight: 500;
}
</style>
