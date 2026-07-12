<script setup lang="ts">
const { todayLabel, pctLabel } = useHydra()
</script>

<template>
  <header class="header">
    <div class="brand">
      <div class="brand-mark">
        <DropIcon :size="20" :opacity="0.95" />
      </div>
      <div>
        <div class="brand-name">Hydra</div>
        <div class="brand-date">{{ todayLabel }}</div>
      </div>
    </div>

    <div class="header-right">
      <div class="hydrated-pill">
        <span class="hydrated-dot" />
        {{ pctLabel }} hydrated
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px 26px 4px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(160deg, #4cc3f7 0%, #1e8fdd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(30, 143, 221, 0.28);
}
.brand-name {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.brand-date {
  font-size: 12.5px;
  color: #6b8398;
  margin-top: 1px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hydrated-pill {
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(190, 215, 235, 0.6);
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 600;
  color: #1e7fc4;
  display: flex;
  align-items: center;
  gap: 7px;
}
.hydrated-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  display: inline-block;
}
</style>
