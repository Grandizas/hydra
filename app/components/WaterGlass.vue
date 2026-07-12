<script setup lang="ts">
const { waterH, hasWater, pouring, pulse, pctLabel, pctColor, pctSubColor } = useHydra()
</script>

<template>
  <div class="glass-wrap">
    <!-- Pour ripple + falling drops (re-keyed on each pour to restart the animation) -->
    <div v-if="pouring" :key="pulse" class="ripple-layer">
      <div class="ripple ripple-1" />
      <div class="ripple ripple-2" />
      <div class="drop drop-1" />
      <div class="drop drop-2" />
    </div>

    <div class="glass-body">
      <div class="water" :style="{ height: waterH }">
        <template v-if="hasWater">
          <div class="swirl swirl-back" />
          <div class="swirl swirl-front" />
          <div class="bubble bubble-1" />
          <div class="bubble bubble-2" />
          <div class="bubble bubble-3" />
          <div class="bubble bubble-4" />
        </template>
      </div>
      <div class="reflection" />
    </div>

    <div class="pct-overlay">
      <div class="pct" :style="{ color: pctColor }">{{ pctLabel }}</div>
      <div class="pct-sub" :style="{ color: pctSubColor }">of daily goal</div>
    </div>
  </div>
</template>

<style scoped>
.glass-wrap {
  position: relative;
  width: 232px;
  height: 316px;
  flex-shrink: 0;
}

.glass-body {
  position: absolute;
  inset: 0;
  border-radius: 26px 26px 44px 44px;
  border: 2px solid rgba(160, 200, 230, 0.55);
  background: linear-gradient(180deg, rgba(240, 249, 255, 0.5), rgba(222, 240, 252, 0.35));
  overflow: hidden;
  box-shadow: inset 0 2px 14px rgba(120, 170, 210, 0.12);
}

.water {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #5cc9f6 0%, #2196e4 100%);
  transition: height 1.3s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: visible;
}

.swirl {
  position: absolute;
  top: -30px;
  left: 50%;
  width: 520px;
  height: 520px;
  margin-left: -260px;
}
.swirl-back {
  border-radius: 46%;
  background: rgba(154, 220, 250, 0.7);
  animation: spinRev 13s linear infinite;
}
.swirl-front {
  top: -22px;
  border-radius: 43%;
  background: #54c4f2;
  animation: spin 9s linear infinite;
}

.bubble {
  position: absolute;
  border-radius: 50%;
}
.bubble-1 {
  bottom: 8px;
  left: 22%;
  width: 7px;
  height: 7px;
  background: rgba(255, 255, 255, 0.55);
  animation: rise 4.2s ease-in infinite;
}
.bubble-2 {
  bottom: 4px;
  left: 48%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.45);
  animation: rise 5.1s ease-in 1.2s infinite;
}
.bubble-3 {
  bottom: 10px;
  left: 70%;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.5);
  animation: rise 4.7s ease-in 2.3s infinite;
}
.bubble-4 {
  bottom: 6px;
  left: 34%;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  animation: rise 5.6s ease-in 0.6s infinite;
}

.reflection {
  position: absolute;
  top: 14px;
  bottom: 20px;
  left: 16px;
  width: 22px;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.04));
  pointer-events: none;
}

.pct-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.pct {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-shadow: 0 1px 8px rgba(255, 255, 255, 0.4);
}
.pct-sub {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Pour overlay */
.ripple-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
.ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
  border-radius: 50%;
}
.ripple-1 {
  border: 2px solid rgba(76, 195, 247, 0.7);
  animation: rippleOut 0.9s ease-out forwards;
}
.ripple-2 {
  border: 2px solid rgba(76, 195, 247, 0.45);
  opacity: 0;
  animation: rippleOut 1.1s ease-out 0.15s forwards;
}
.drop {
  position: absolute;
  top: 0;
  border-radius: 50% 50% 60% 60%;
  background: linear-gradient(180deg, #8ed9f9, #2f9fe6);
}
.drop-1 {
  left: 46%;
  width: 8px;
  height: 18px;
  animation: dropFall 0.7s ease-in forwards;
}
.drop-2 {
  left: 53%;
  width: 6px;
  height: 14px;
  opacity: 0;
  animation: dropFall 0.8s ease-in 0.12s forwards;
}
</style>
