<script setup lang="ts">
const {
  quickAdds,
  addAmount,
  toggleCustom,
  showCustom,
  customVal,
  submitCustom
} = useHydra()

function onCustomKey(e: KeyboardEvent) {
  if (e.key === 'Enter') submitCustom()
}
</script>

<template>
  <div>
    <div class="section-label">Quick add</div>
    <div class="quick-row">
      <button v-for="qa in quickAdds" :key="qa.ml" class="qa-btn" @click="addAmount(qa.ml)">
        {{ qa.label }}
      </button>
      <button class="qa-custom" @click="toggleCustom">Custom</button>
    </div>

    <Transition name="fade-up">
      <div v-if="showCustom" class="custom-row">
        <input
          v-model="customVal"
          type="number"
          placeholder="Amount in ml"
          class="custom-input"
          @keydown="onCustomKey"
        />
        <button class="custom-submit" @click="submitCustom">Add</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b8398;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.quick-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.qa-btn {
  padding: 14px 22px;
  border-radius: 18px;
  border: 1px solid rgba(170, 205, 232, 0.6);
  background: rgba(255, 255, 255, 0.85);
  font-size: 15px;
  font-weight: 700;
  color: #1e7fc4;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 8px rgba(30, 110, 170, 0.06);
}
.qa-btn:hover {
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(30, 143, 221, 0.3);
}
.qa-btn:active {
  transform: translateY(0) scale(0.97);
}
.qa-custom {
  padding: 14px 22px;
  border-radius: 18px;
  border: 1px dashed rgba(140, 180, 215, 0.7);
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #6b8398;
  cursor: pointer;
  transition: all 0.18s ease;
}
.qa-custom:hover {
  border-color: #1e8fdd;
  color: #1e8fdd;
  background: rgba(255, 255, 255, 0.6);
}

.custom-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.custom-input {
  padding: 12px 18px;
  border-radius: 16px;
  border: 1px solid rgba(170, 205, 232, 0.7);
  background: white;
  font-size: 15px;
  font-weight: 600;
  color: #10293a;
  outline: none;
  width: 150px;
}
.custom-submit {
  padding: 12px 24px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(30, 143, 221, 0.28);
  transition: filter 0.15s ease, transform 0.1s ease;
}
.custom-submit:hover {
  filter: brightness(1.06);
}
.custom-submit:active {
  transform: scale(0.97);
}

.fade-up-enter-active {
  animation: fadeUp 0.3s ease;
}
</style>
