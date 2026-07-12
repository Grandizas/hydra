<script setup lang="ts">
const { insights } = useHydra()
</script>

<template>
  <section class="hydra-card" data-screen-label="Insights">
    <h3 class="card-title">Insights</h3>

    <div class="list">
      <div v-for="(ins, i) in insights" :key="i" class="insight">
        <span class="icon">{{ ins.icon }}</span>
        <p class="text">{{ ins.text }}</p>
      </div>
    </div>

    <p v-if="insights.length < 3" class="card-footnote more">
      More insights arrive as Hydra learns your rhythm over the coming days.
    </p>
  </section>
</template>

<style scoped>
.list {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.insight {
  display: flex;
  gap: 13px;
  padding: 15px 17px;
  border-radius: 18px;
  background: linear-gradient(140deg, rgba(232, 246, 254, 0.9), rgba(240, 250, 255, 0.6));
  border: 1px solid rgba(200, 228, 246, 0.6);
  animation: fadeUp 0.4s ease;
}
.icon {
  font-size: 16px;
  line-height: 1.3;
}
.text {
  margin: 0;
  font-size: 14px;
  color: #33506a;
  line-height: 1.55;
}
.more {
  font-size: 13px;
  margin-top: 16px;
  line-height: 1.55;
}
</style>
