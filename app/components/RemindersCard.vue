<script setup lang="ts">
const {
  remindersOn,
  toggleReminders,
  reminderOptions,
  pickReminder,
  reminderChoice,
  customInterval,
  customStart,
  customEnd,
  setCustomSchedule
} = useHydra()
const { permission, requestNotifications, sendTestReminder } = useReminders()

async function onToggle() {
  const turningOn = !remindersOn.value
  toggleReminders()
  // Turning reminders on is a user gesture — a good moment to ask for permission.
  if (turningOn && permission.value === 'default') await requestNotifications()
}

const num = (e: Event) => Number((e.target as HTMLInputElement).value)

// Minutes since midnight <-> "HH:MM" for the <input type="time"> fields.
const toHM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
function hmToMin(e: Event) {
  const [h, m] = (e.target as HTMLInputElement).value.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

</script>

<template>
  <section class="hydra-card" data-screen-label="Reminders">
    <div class="head">
      <h3 class="card-title">Reminders</h3>
      <button
        class="switch"
        :class="{ on: remindersOn }"
        :aria-pressed="remindersOn"
        @click="onToggle"
      >
        <span class="knob" />
      </button>
    </div>

    <!-- Notification permission / status -->
    <div class="notify">
      <button v-if="permission === 'default'" class="notify-btn" @click="requestNotifications">
        🔔 Enable notifications
      </button>

      <div v-else-if="permission === 'granted'" class="notify-status ok">
        <span>🔔 Notifications are on</span>
        <button class="test-btn" @click="sendTestReminder">Send a test</button>
      </div>

      <p v-else-if="permission === 'denied'" class="notify-note">
        Notifications are blocked. Enable them for this site in your browser settings, then reload.
      </p>

      <p v-else class="notify-note">This browser doesn't support notifications.</p>
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

      <!-- Custom schedule editor -->
      <div v-if="reminderChoice === 'Custom schedule'" class="custom-sched">
        <label class="field">
          <span>Every</span>
          <input
            type="number"
            min="5"
            max="240"
            step="5"
            :value="customInterval"
            @change="setCustomSchedule({ interval: num($event) })"
          />
          <span>min</span>
        </label>
        <label class="field">
          <span>From</span>
          <input
            type="time"
            :value="toHM(customStart)"
            @change="setCustomSchedule({ start: hmToMin($event) })"
          />
          <span>to</span>
          <input
            type="time"
            :value="toHM(customEnd)"
            @change="setCustomSchedule({ end: hmToMin($event) })"
          />
        </label>
      </div>
    </div>

    <p class="card-footnote">
      Gentle nudges with encouraging words — never guilt. Reminders fire while Hydra is open in a tab.
    </p>
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

/* Notification block */
.notify {
  margin-top: 16px;
}
.notify-btn {
  width: 100%;
  padding: 12px 18px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  color: white;
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  box-shadow: 0 8px 18px rgba(30, 143, 221, 0.24);
  transition: filter 0.15s ease, transform 0.1s ease;
}
.notify-btn:hover {
  filter: brightness(1.06);
}
.notify-btn:active {
  transform: scale(0.99);
}
.notify-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  border-radius: 16px;
  font-size: 13.5px;
  font-weight: 600;
}
.notify-status.ok {
  color: #146fae;
  background: linear-gradient(140deg, rgba(76, 195, 247, 0.14), rgba(30, 143, 221, 0.08));
  border: 1px solid rgba(76, 195, 247, 0.4);
}
.test-btn {
  border: none;
  background: transparent;
  color: #1e8fdd;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  padding: 2px 4px;
}
.test-btn:hover {
  text-decoration: underline;
}
.notify-note {
  margin: 0;
  font-size: 12.5px;
  color: #93a9bb;
  line-height: 1.5;
}

.options {
  margin-top: 16px;
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

.custom-sched {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(240, 248, 254, 0.8);
  border: 1px solid rgba(200, 224, 242, 0.6);
  animation: fadeUp 0.3s ease;
}
.field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: #4a6b84;
}
.field input {
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(170, 205, 232, 0.7);
  background: white;
  font-size: 14px;
  font-weight: 700;
  color: #10293a;
  outline: none;
}
.field input[type='number'] {
  width: 58px;
}
.field input[type='time'] {
  font-family: inherit;
}
.field input:focus {
  border-color: #1e8fdd;
}
</style>
