<script setup lang="ts">
const { displayMlLabel, goalLabel, journeyText, journeyKey, goalReached } = useHydra()
</script>

<template>
  <section class="hero" data-screen-label="Today progress">
    <WaterGlass />

    <div class="hero-right">
      <div>
        <div class="section-label">Today</div>
        <div class="today-amount">
          <span class="today-big">{{ displayMlLabel }}</span>
          <span class="today-goal">/ {{ goalLabel }} ml</span>
        </div>
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
  font-size: 19px;
  font-weight: 600;
  color: #8aa2b5;
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
