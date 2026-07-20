<script setup lang="ts">
import { ref } from 'vue'

const { exportData, importData } = useHydra()

const fileInput = ref<HTMLInputElement | null>(null)
const message = ref('')
const messageOk = ref(false)

function say(text: string, ok = false) {
  message.value = text
  messageOk.value = ok
}

function exportBackup() {
  const json = exportData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  a.href = url
  a.download = `hydra-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  say('Backup downloaded.', true)
}

function pickFile() {
  say('')
  fileInput.value?.click()
}

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  let text = ''
  try {
    text = await file.text()
  } catch {
    say('Could not read this file.')
    return
  }
  input.value = '' // allow re-selecting the same file

  // Peek to validate + show a count before we overwrite anything.
  let days = 0
  try {
    const parsed = JSON.parse(text)
    if (!parsed || parsed.app !== 'hydra' || !Array.isArray(parsed.history)) {
      say('This does not look like a Hydra backup.')
      return
    }
    days = parsed.history.length
  } catch {
    say('Could not read this file.')
    return
  }

  const proceed = window.confirm(
    `Restore this backup (${days} day${days === 1 ? '' : 's'} of history)? This replaces your current Hydra data.`
  )
  if (!proceed) return

  const res = importData(text)
  if (res.ok) {
    location.reload()
  } else {
    say(res.error || 'Import failed.')
  }
}
</script>

<template>
  <footer class="backup">
    <div class="backup-info">
      <span class="backup-title">Your data</span>
      <span class="backup-sub">
        Stored on this device only. Export a backup so you don't lose your history if you clear your
        browser or switch computers.
      </span>
    </div>

    <div class="backup-actions">
      <button class="btn" @click="exportBackup">Export backup</button>
      <button class="btn ghost" @click="pickFile">Import backup</button>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="hidden-input"
        @change="onFile"
      />
      <span v-if="message" class="backup-msg" :class="{ ok: messageOk }">{{ message }}</span>
    </div>
  </footer>
</template>

<style scoped>
.backup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 28px;
  padding: 20px 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(200, 224, 242, 0.5);
}
.backup-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 560px;
}
.backup-title {
  font-size: 14px;
  font-weight: 700;
  color: #1c3a52;
}
.backup-sub {
  font-size: 12.5px;
  color: #7d94a8;
  line-height: 1.5;
}
.backup-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.btn {
  padding: 10px 18px;
  border-radius: 13px;
  border: none;
  background: linear-gradient(160deg, #4cc3f7, #1e8fdd);
  color: white;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(30, 143, 221, 0.22);
  transition: filter 0.15s ease, transform 0.1s ease;
}
.btn:hover {
  filter: brightness(1.06);
}
.btn:active {
  transform: scale(0.97);
}
.btn.ghost {
  background: transparent;
  color: #1e7fc4;
  border: 1px solid rgba(170, 205, 232, 0.7);
  box-shadow: none;
}
.btn.ghost:hover {
  border-color: #1e8fdd;
  background: rgba(255, 255, 255, 0.6);
  filter: none;
}
.hidden-input {
  display: none;
}
.backup-msg {
  font-size: 12.5px;
  font-weight: 600;
  color: #c0603f;
}
.backup-msg.ok {
  color: #189a6c;
}
</style>
