<script setup lang="ts">
const { feel, pctLabel } = useHydra()
</script>

<template>
  <section class="hydra-card" data-screen-label="How you might feel">
    <div class="head">
      <h3 class="card-title">How you might feel</h3>
      <span class="badge" :style="{ color: feel.color, background: feel.bg }">{{ pctLabel }}</span>
    </div>
    <div class="effects">
      <div v-for="text in feel.effects" :key="text" class="effect">
        <span class="dot" :style="{ background: feel.color }" />
        {{ text }}
      </div>
    </div>
    <p class="card-footnote">General estimates only — not medical advice.</p>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.badge {
  font-size: 13px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}
.effects {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.effect {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 14.5px;
  color: #3d5a70;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0.7;
}
</style>
