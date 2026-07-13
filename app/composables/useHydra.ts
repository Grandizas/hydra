import { computed } from 'vue'

export interface Entry {
  ml: number
  t: number
}

export interface QuickAdd {
  label: string
  ml: number
}

const STORAGE_KEY = 'hydra:v1'
const QUICK_ADD_AMOUNTS = [100, 250, 500, 750]
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const REMINDER_DEFS = [
  { label: 'Every 45 minutes', sub: 'Steady rhythm' },
  { label: 'Morning only', sub: '7 AM – 12 PM' },
  { label: 'Work hours', sub: '9 AM – 6 PM' },
  { label: 'Custom schedule', sub: 'You choose' }
]

const JOURNEY_MESSAGES = [
  'Your first glass starts the day.',
  'Great start. Your body is waking up.',
  'Cells begin hydrating more efficiently.',
  'Many people notice improved focus.',
  'Your brain appreciates this.',
  'Hydration supports steady energy.',
  "You're building a healthy habit.",
  'Nearly there — steady as a stream.',
  'Almost at your goal. Keep flowing.'
]

// Client-only timers, kept at module scope (single dashboard instance).
let rafId: number | null = null
let pourTimer: ReturnType<typeof setTimeout> | null = null
let didInit = false

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function fmtTime(t: number) {
  const d = new Date(t)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Minutes since midnight → "HH:MM" (1440 → "24:00").
export function fmtHM(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function useHydra() {
  const entries = useState<Entry[]>('hydra-entries', () => [])
  const displayMl = useState<number>('hydra-displayMl', () => 0)
  const pouring = useState<boolean>('hydra-pouring', () => false)
  const pulse = useState<number>('hydra-pulse', () => 0)
  const showCustom = useState<boolean>('hydra-showCustom', () => false)
  const customVal = useState<string>('hydra-customVal', () => '')
  const remindersOn = useState<boolean>('hydra-remindersOn', () => true)
  const reminderChoice = useState<string>('hydra-reminderChoice', () => 'Every 45 minutes')
  const goal = useState<number>('hydra-goal', () => 2500)

  // Custom-schedule settings (used when reminderChoice === 'Custom schedule').
  // Window bounds are stored as minutes since midnight (e.g. 9:30 = 570).
  const customInterval = useState<number>('hydra-customInterval', () => 60) // minutes
  const customStart = useState<number>('hydra-customStart', () => 7 * 60) // 07:00
  const customEnd = useState<number>('hydra-customEnd', () => 21 * 60) // 21:00

  // --- Derived core values ---
  const total = computed(() => entries.value.reduce((s, e) => s + e.ml, 0))
  const count = computed(() => entries.value.length)
  const rawPct = computed(() => (total.value / goal.value) * 100)
  const pct = computed(() => Math.min(100, Math.round(rawPct.value)))
  const goalReached = computed(() => rawPct.value >= 100)

  // --- Persistence ---
  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: todayKey(),
          entries: entries.value,
          remindersOn: remindersOn.value,
          reminderChoice: reminderChoice.value,
          customInterval: customInterval.value,
          customStart: customStart.value,
          customEnd: customEnd.value
        })
      )
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  }

  function init() {
    if (!import.meta.client || didInit) return
    didInit = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        remindersOn.value = data.remindersOn !== false
        reminderChoice.value = data.reminderChoice || 'Every 45 minutes'
        if (typeof data.customInterval === 'number') customInterval.value = data.customInterval
        if (typeof data.customStart === 'number' && typeof data.customEnd === 'number') {
          // Migrate legacy whole-hour bounds (both ≤ 24) to minutes since midnight.
          const legacy = data.customStart <= 24 && data.customEnd <= 24
          customStart.value = legacy ? data.customStart * 60 : data.customStart
          customEnd.value = legacy ? data.customEnd * 60 : data.customEnd
        }
        if (data.date === todayKey() && Array.isArray(data.entries)) {
          entries.value = data.entries
        }
      }
    } catch {
      /* corrupt payload — start fresh */
    }
    displayMl.value = total.value
  }

  // --- Animated counter ---
  function animateCounter(to: number) {
    // No animation off the client, or when the tab is hidden (rAF is paused
    // there, which would otherwise leave the counter stuck at its old value).
    if (!import.meta.client || document.hidden) {
      displayMl.value = to
      return
    }
    if (rafId) cancelAnimationFrame(rafId)
    const from = displayMl.value
    const start = performance.now()
    const dur = 900
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const ease = 1 - Math.pow(1 - t, 3)
      displayMl.value = Math.round(from + (to - from) * ease)
      if (t < 1) rafId = requestAnimationFrame(step)
    }
    rafId = requestAnimationFrame(step)
  }

  // --- Mutations ---
  function addAmount(ml: number) {
    if (!ml || ml <= 0 || ml > 3000) return
    entries.value = [...entries.value, { ml: Math.round(ml), t: Date.now() }]
    pulse.value += 1
    pouring.value = true
    showCustom.value = false
    customVal.value = ''
    persist()
    animateCounter(total.value)
    if (pourTimer) clearTimeout(pourTimer)
    pourTimer = setTimeout(() => {
      pouring.value = false
    }, 1100)
  }

  function removeEntry(i: number) {
    entries.value = entries.value.filter((_, idx) => idx !== i)
    persist()
    animateCounter(total.value)
  }

  function toggleCustom() {
    showCustom.value = !showCustom.value
  }

  function submitCustom() {
    addAmount(parseInt(customVal.value, 10))
  }

  function toggleReminders() {
    remindersOn.value = !remindersOn.value
    persist()
  }

  function pickReminder(label: string) {
    reminderChoice.value = label
    persist()
  }

  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

  // Window bounds are minutes since midnight (0–1440).
  function setCustomSchedule(patch: { interval?: number; start?: number; end?: number }) {
    if (patch.interval != null && Number.isFinite(patch.interval))
      customInterval.value = clamp(Math.round(patch.interval), 5, 240)
    if (patch.start != null && Number.isFinite(patch.start))
      customStart.value = clamp(Math.round(patch.start), 0, 1439)
    if (patch.end != null && Number.isFinite(patch.end))
      customEnd.value = clamp(Math.round(patch.end), 1, 1440)
    // Keep the window valid: end must be at least 15 min after start.
    if (customEnd.value <= customStart.value)
      customEnd.value = Math.min(1440, customStart.value + 15)
    persist()
  }

  // --- Presentation values ---
  const todayLabel = computed(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  )
  const pctLabel = computed(() => `${pct.value}%`)
  const pctColor = computed(() => (pct.value >= 55 ? 'rgba(255,255,255,0.95)' : '#1c3a52'))
  const pctSubColor = computed(() => (pct.value >= 45 ? 'rgba(255,255,255,0.8)' : '#7d94a8'))
  const waterH = computed(() => `${Math.max(0, Math.min(100, rawPct.value))}%`)
  const hasWater = computed(() => total.value > 0)
  const displayMlLabel = computed(() => displayMl.value.toLocaleString())
  const goalLabel = computed(() => goal.value.toLocaleString())

  const journeyText = computed(() =>
    goalReached.value
      ? 'Goal reached. Beautifully done.'
      : JOURNEY_MESSAGES[Math.min(count.value, JOURNEY_MESSAGES.length - 1)]
  )
  // Key forces a fresh fade-up whenever the message changes.
  const journeyKey = computed(() => `j${count.value}${goalReached.value ? 'g' : ''}`)

  const quickAdds = computed<QuickAdd[]>(() =>
    QUICK_ADD_AMOUNTS.map((ml) => ({ label: `+${ml} ml`, ml }))
  )

  const feel = computed(() => {
    const p = rawPct.value
    if (p < 40)
      return {
        color: '#d98a3d',
        bg: 'rgba(217,138,61,0.12)',
        effects: ['Dry mouth may set in', 'Lower concentration', 'Mild fatigue', 'Headache risk may be higher']
      }
    if (p < 75)
      return {
        color: '#2b9fd9',
        bg: 'rgba(43,159,217,0.12)',
        effects: ['Normal energy levels', 'Decent concentration', 'Improved alertness']
      }
    return {
      color: '#189a6c',
      bg: 'rgba(24,154,108,0.12)',
      effects: ['Good hydration', 'Sustained focus', 'Healthy recovery', 'Body functioning efficiently']
    }
  })

  const entriesView = computed(() =>
    entries.value
      .map((e, i) => ({
        id: e.t,
        index: i,
        time: fmtTime(e.t),
        mlLabel: `${e.ml.toLocaleString()} ml`
      }))
      .reverse()
  )

  const customSummary = computed(
    () => `Every ${customInterval.value}m · ${fmtHM(customStart.value)}–${fmtHM(customEnd.value)}`
  )

  const reminderOptions = computed(() =>
    REMINDER_DEFS.map((o) => {
      const sel = reminderChoice.value === o.label
      return {
        label: o.label,
        sub: o.label === 'Custom schedule' ? customSummary.value : o.sub,
        selected: sel,
        border: sel ? 'rgba(30,143,221,0.55)' : 'rgba(200,224,242,0.6)',
        bg: sel
          ? 'linear-gradient(140deg, rgba(76,195,247,0.14), rgba(30,143,221,0.1))'
          : 'rgba(250,253,255,0.7)',
        color: sel ? '#146fae' : '#4a6b84',
        subColor: sel ? '#3a95cf' : '#93a9bb'
      }
    })
  )

  const weekBars = computed(() => {
    const todayIdx = (new Date().getDay() + 6) % 7
    return DAY_NAMES.map((day, i) => {
      const isToday = i === todayIdx
      return {
        day,
        h: isToday ? `${Math.max(8, pct.value)}%` : '8%',
        fill: isToday ? 'linear-gradient(180deg, #4cc3f7, #1e8fdd)' : 'rgba(210,228,242,0.8)',
        labelColor: isToday ? '#1e7fc4' : '#93a9bb'
      }
    })
  })

  const statChips = computed(() => {
    const now = new Date()
    const hoursLeft = Math.max(1, 22 - now.getHours())
    const remaining = Math.max(0, goal.value - total.value)
    const pace =
      remaining === 0 ? 'Goal reached' : `~${Math.ceil(remaining / hoursLeft / 10) * 10} ml/hr`
    return [
      { label: 'Cups today', value: String(count.value) },
      { label: 'Average pour', value: count.value ? `${Math.round(total.value / count.value)} ml` : '—' },
      { label: 'First sip', value: count.value ? fmtTime(entries.value[0].t) : '—' },
      { label: 'Pace to goal', value: pace }
    ]
  })

  const insights = computed(() => {
    const list: { icon: string; text: string }[] = []
    if (count.value > 0) {
      const beforeNoon = entries.value
        .filter((e) => new Date(e.t).getHours() < 12)
        .reduce((a, e) => a + e.ml, 0)
      if (beforeNoon / Math.max(1, total.value) > 0.6 && total.value > 0)
        list.push({
          icon: '◐',
          text: 'Most of your water today came before noon — a strong pattern for reaching your goal.'
        })
      const biggest = Math.max(...entries.value.map((e) => e.ml))
      if (biggest >= 500)
        list.push({
          icon: '◎',
          text: `Nice big pour of ${biggest} ml — larger glasses make the goal feel effortless.`
        })
      if (rawPct.value >= 100)
        list.push({ icon: '✦', text: 'Goal reached — days like this are how streaks begin.' })
      if (list.length === 0)
        list.push({ icon: '◦', text: 'A steady start. Small, regular sips beat occasional large ones.' })
    } else {
      list.push({
        icon: '◦',
        text: 'People who drink a glass within an hour of waking usually reach their goal.'
      })
    }
    return list
  })

  const achievements = computed(() => {
    const defs = [
      { name: 'First Drop', desc: 'Log your first glass', unlocked: count.value >= 1 },
      { name: '1L Club', desc: 'Drink 1 liter in a day', unlocked: total.value >= 1000 },
      { name: 'Ocean Mode', desc: 'Reach your daily goal', unlocked: rawPct.value >= 100 },
      { name: '7-Day Streak', desc: 'Seven days in a row', unlocked: false },
      { name: 'Hydration Hero', desc: '30 goal days total', unlocked: false },
      { name: '365 Days', desc: 'A full year of Hydra', unlocked: false }
    ]
    return defs.map((a) => ({
      name: a.name,
      desc: a.desc,
      unlocked: a.unlocked,
      border: a.unlocked ? 'rgba(76,195,247,0.5)' : 'rgba(210,226,240,0.5)',
      bg: a.unlocked
        ? 'linear-gradient(150deg, rgba(76,195,247,0.12), rgba(30,143,221,0.07))'
        : 'rgba(248,251,254,0.6)',
      opacity: a.unlocked ? 1 : 0.55,
      iconBg: a.unlocked ? 'linear-gradient(160deg, #4cc3f7, #1e8fdd)' : 'rgba(215,230,242,0.9)',
      iconFill: a.unlocked ? 'white' : '#a8bccb',
      nameColor: a.unlocked ? '#146fae' : '#7d94a8'
    }))
  })

  return {
    // state
    entries,
    displayMl,
    pouring,
    pulse,
    showCustom,
    customVal,
    remindersOn,
    reminderChoice,
    goal,
    customInterval,
    customStart,
    customEnd,
    // core derived
    total,
    count,
    pct,
    goalReached,
    // actions
    init,
    addAmount,
    removeEntry,
    toggleCustom,
    submitCustom,
    toggleReminders,
    pickReminder,
    setCustomSchedule,
    // presentation
    todayLabel,
    pctLabel,
    pctColor,
    pctSubColor,
    waterH,
    hasWater,
    displayMlLabel,
    goalLabel,
    journeyText,
    journeyKey,
    quickAdds,
    feel,
    entriesView,
    reminderOptions,
    weekBars,
    statChips,
    insights,
    achievements
  }
}
