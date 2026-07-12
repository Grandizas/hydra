<script setup lang="ts">
const { achievements } = useHydra()
</script>

<template>
  <section class="hydra-card" data-screen-label="Achievements">
    <h3 class="card-title">Achievements</h3>

    <div class="grid">
      <div
        v-for="ac in achievements"
        :key="ac.name"
        class="badge"
        :title="ac.desc"
        :style="{ border: `1px solid ${ac.border}`, background: ac.bg, opacity: ac.opacity }"
      >
        <div class="icon" :style="{ background: ac.iconBg }">
          <DropIcon :size="18" :fill="ac.iconFill" />
        </div>
        <div class="name" :style="{ color: ac.nameColor }">{{ ac.name }}</div>
        <div class="desc">{{ ac.desc }}</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}
.badge {
  padding: 16px 14px;
  border-radius: 18px;
  text-align: center;
  transition: all 0.25s ease;
}
.icon {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.name {
  font-size: 13px;
  font-weight: 700;
  margin-top: 9px;
}
.desc {
  font-size: 11px;
  color: #93a9bb;
  margin-top: 2px;
}
</style>
