<script setup lang="ts">
const { weekBars, statChips } = useHydra()
</script>

<template>
  <section class="hydra-card" data-screen-label="Analytics">
    <h3 class="card-title">This week</h3>

    <div class="chart">
      <div v-for="wb in weekBars" :key="wb.day" class="bar-col">
        <div class="bar" :style="{ height: wb.h, background: wb.fill }" />
        <span class="bar-label" :style="{ color: wb.labelColor }">{{ wb.day }}</span>
      </div>
    </div>

    <div class="chips">
      <div v-for="st in statChips" :key="st.label" class="chip">
        <div class="chip-label">{{ st.label }}</div>
        <div class="chip-value">{{ st.value }}</div>
      </div>
    </div>

    <p class="card-footnote">Charts fill in as your week unfolds.</p>
  </section>
</template>

<style scoped>
.chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 130px;
  margin-top: 22px;
  padding: 0 4px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}
.bar {
  width: 100%;
  max-width: 34px;
  border-radius: 10px;
  transition: height 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.bar-label {
  font-size: 11.5px;
  font-weight: 600;
}

.chips {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 22px;
}
.chip {
  padding: 13px 16px;
  border-radius: 16px;
  background: rgba(240, 248, 254, 0.8);
  border: 1px solid rgba(200, 224, 242, 0.5);
}
.chip-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #7d94a8;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.chip-value {
  font-size: 16px;
  font-weight: 700;
  color: #1c3a52;
  margin-top: 3px;
}
</style>
