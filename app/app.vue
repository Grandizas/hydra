<script setup lang="ts">
const { init } = useHydra()

onMounted(() => init())
</script>

<template>
  <div class="dashboard">
    <AppHeader />
    <HeroProgress />
    <RhythmCard />

    <div class="row">
      <FeelCard />
      <TimelineCard />
      <RemindersCard />
    </div>

    <div class="row">
      <AnalyticsCard />
      <InsightsCard />
      <AchievementsCard />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1180px;
  margin: 0 auto;
  padding: 28px 32px 64px 32px;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 22px;
  margin-top: 22px;
}
</style>
