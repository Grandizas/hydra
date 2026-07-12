<script setup lang="ts">
const { entriesView, removeEntry } = useHydra()
</script>

<template>
  <section class="hydra-card" data-screen-label="Timeline">
    <h3 class="card-title">Today's timeline</h3>

    <div v-if="entriesView.length" class="timeline">
      <TransitionGroup name="entry">
        <div v-for="en in entriesView" :key="en.id" class="entry">
          <div class="rail">
            <span class="node" />
          </div>
          <span class="time">{{ en.time }}</span>
          <span class="amount">{{ en.mlLabel }}</span>
          <button class="remove" title="Remove entry" @click="removeEntry(en.index)">×</button>
        </div>
      </TransitionGroup>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">
        <DropIcon :size="22" fill="#4cc3f7" :opacity="0.8" />
      </div>
      <p class="empty-text">No drops yet.<br />Your first glass starts the day.</p>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  max-height: 260px;
  overflow-y: auto;
}
.entry {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 2px;
}
.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
}
.node {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  box-shadow: 0 0 0 4px rgba(76, 195, 247, 0.15);
  flex-shrink: 0;
  margin-top: 6px;
}
.time {
  font-size: 13px;
  font-weight: 600;
  color: #6b8398;
  width: 46px;
}
.amount {
  font-size: 15px;
  font-weight: 700;
  color: #10293a;
  flex: 1;
}
.remove {
  border: none;
  background: transparent;
  color: #b6c8d6;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 8px;
  line-height: 1;
  transition: color 0.15s ease, background 0.15s ease;
}
.remove:hover {
  color: #e2705f;
  background: rgba(226, 112, 95, 0.08);
}

.empty {
  margin-top: 24px;
  text-align: center;
  padding: 24px 12px;
}
.empty-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto;
  border-radius: 50%;
  background: rgba(76, 195, 247, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: floaty 3.5s ease-in-out infinite;
}
.empty-text {
  margin: 16px 0 0 0;
  font-size: 14px;
  color: #6b8398;
  line-height: 1.5;
}

.entry-enter-active {
  animation: fadeUp 0.35s ease;
}
.entry-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.entry-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
