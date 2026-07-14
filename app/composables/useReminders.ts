import { computed, watch, onMounted } from 'vue'

export type NotifyState = 'default' | 'granted' | 'denied' | 'unsupported'

interface Schedule {
  intervalMin: number
  startMin: number // minutes since midnight
  endMin: number
}

// Reminder cadence + active window per schedule choice (minutes since midnight).
const SCHEDULES: Record<string, Schedule> = {
  'Every 45 minutes': { intervalMin: 45, startMin: 7 * 60, endMin: 22 * 60 },
  'Morning only': { intervalMin: 45, startMin: 7 * 60, endMin: 12 * 60 },
  'Work hours': { intervalMin: 45, startMin: 9 * 60, endMin: 18 * 60 },
  'Custom schedule': { intervalMin: 60, startMin: 7 * 60, endMin: 22 * 60 }
}

// Encouraging, never-guilt copy to match the app's tone.
const REMINDER_MESSAGES = [
  'A good moment for a few sips.',
  'Time to top up — your body will thank you.',
  'Hydration break! A glass of water sounds nice.',
  'Keep the stream flowing — sip some water.',
  'A little water goes a long way right now.'
]

const CHECK_EVERY_MS = 20_000
const LAST_KEY = 'hydra:lastReminder'

// Module-level singletons so the scheduler exists once, regardless of how many
// components call the composable.
let tickTimer: ReturnType<typeof setInterval> | null = null
let lastReminderAt = 0
let msgIdx = 0
let bound = false

function supportedNow() {
  return import.meta.client && typeof window !== 'undefined' && 'Notification' in window
}

// Minutes since midnight → "HH:MM".
const toHM = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

export function useReminders() {
  const {
    remindersOn,
    reminderChoice,
    goalReached,
    entries,
    total,
    goal,
    customInterval,
    customStart,
    customEnd,
    rhythmMode,
    cupSize
  } = useHydra()

  const permission = useState<NotifyState>('hydra-notify-perm', () => 'default')
  const supported = computed(() => permission.value !== 'unsupported')
  const active = computed(() => remindersOn.value && permission.value === 'granted')

  const schedule = computed<Schedule>(() => {
    if (reminderChoice.value === 'Custom schedule') {
      return {
        intervalMin: customInterval.value,
        startMin: customStart.value,
        endMin: customEnd.value
      }
    }
    return SCHEDULES[reminderChoice.value] ?? SCHEDULES['Every 45 minutes']
  })

  // A recommended cup-by-cup plan. The reminders fire on exactly these slots.
  //  - 'time': the schedule's clock slots, each an even share of the goal.
  //  - 'cup' : a fixed cup size, fitted evenly across the window.
  const rhythm = computed(() => {
    const s = schedule.value
    const windowMin = Math.max(0, s.endMin - s.startMin)

    let cups: { min: number; time: string; ml: number }[]
    let stepMin: number

    if (rhythmMode.value === 'cup') {
      const cup = Math.max(10, cupSize.value)
      const count = Math.max(1, Math.ceil(goal.value / cup))
      stepMin = windowMin ? Math.round(windowMin / count) : 0
      cups = Array.from({ length: count }, (_, i) => {
        const min = Math.round(s.startMin + (windowMin * i) / count)
        // Last cup carries the remainder so the day sums to the goal exactly.
        const ml = i < count - 1 ? cup : goal.value - cup * (count - 1)
        return { min, time: toHM(min), ml: Math.max(0, ml) }
      })
    } else {
      const interval = Math.max(5, s.intervalMin)
      const mins: number[] = []
      for (let m = s.startMin; m < s.endMin; m += interval) mins.push(m)
      const perCup = mins.length ? Math.round(goal.value / mins.length / 10) * 10 : 0
      stepMin = interval
      cups = mins.map((m) => ({ min: m, time: toHM(m), ml: perCup }))
    }

    return {
      mode: rhythmMode.value,
      cups,
      count: cups.length,
      cupSize: cupSize.value,
      perCup: cups.length ? cups[0].ml : 0,
      stepMin,
      startMin: s.startMin,
      endMin: s.endMin
    }
  })

  function syncPermission() {
    permission.value = supportedNow() ? (Notification.permission as NotifyState) : 'unsupported'
  }

  function persistLast() {
    try {
      localStorage.setItem(LAST_KEY, String(lastReminderAt))
    } catch {
      /* ignore */
    }
  }

  function show(title: string, body: string, tag: string) {
    if (!supportedNow() || Notification.permission !== 'granted') return
    try {
      const n = new Notification(title, { body, tag, renotify: true })
      n.onclick = () => {
        window.focus()
        n.close()
      }
    } catch {
      /* some browsers throw if constructed without an active document */
    }
  }

  function nextMessage() {
    const msg = REMINDER_MESSAGES[msgIdx % REMINDER_MESSAGES.length]
    msgIdx++
    return msg
  }

  function fireReminder(cupMl?: number) {
    const remaining = Math.max(0, goal.value - total.value)
    const tail =
      remaining > 0
        ? cupMl
          ? `About ${cupMl.toLocaleString()} ml this time · ${remaining.toLocaleString()} ml to go.`
          : `${remaining.toLocaleString()} ml to go today.`
        : 'You have reached your goal — lovely.'
    show('Time to hydrate 💧', `${nextMessage()}\n${tail}`, 'hydra-reminder')
    lastReminderAt = Date.now()
    persistLast()
  }

  // The most recent rhythm cup at/just before `nowMin`, or null if before the first.
  function currentCup(nowMin: number) {
    let cup: { min: number; ml: number } | null = null
    for (const c of rhythm.value.cups) {
      if (c.min <= nowMin) cup = c
      else break
    }
    return cup
  }

  // Decides — on each tick — whether a reminder is due.
  function maybeNotify() {
    if (!active.value || goalReached.value) return

    const s = schedule.value
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    if (nowMin < s.startMin || nowMin >= s.endMin) return

    // Fire once per rhythm slot, and skip a slot if you already drank during it.
    const cup = currentCup(nowMin)
    if (!cup) return
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const slotTs = midnight + cup.min * 60_000
    const lastEntry = entries.value.length ? entries.value[entries.value.length - 1].t : 0
    if (lastReminderAt < slotTs && lastEntry < slotTs) fireReminder(cup.ml)
  }

  function startScheduler() {
    if (tickTimer) return
    maybeNotify() // check the current slot right away rather than after a tick
    tickTimer = setInterval(maybeNotify, CHECK_EVERY_MS)
  }

  function stopScheduler() {
    if (tickTimer) {
      clearInterval(tickTimer)
      tickTimer = null
    }
  }

  async function requestNotifications(): Promise<NotifyState> {
    if (!supportedNow()) {
      permission.value = 'unsupported'
      return 'unsupported'
    }
    try {
      const res = (await Notification.requestPermission()) as NotifyState
      permission.value = res
      if (res === 'granted') {
        remindersOn.value = true
        startScheduler()
      }
      return res
    } catch {
      return permission.value
    }
  }

  // Fires an immediate notification so the user can confirm reminders work.
  async function sendTestReminder() {
    if (permission.value !== 'granted') {
      const res = await requestNotifications()
      if (res !== 'granted') return
    }
    show('Hydra reminder 💧', `${nextMessage()}\nThis is a test — reminders are working.`, 'hydra-test')
  }

  onMounted(() => {
    if (!import.meta.client) return
    syncPermission()
    try {
      const v = localStorage.getItem(LAST_KEY)
      if (v) lastReminderAt = parseInt(v, 10) || 0
    } catch {
      /* ignore */
    }

    if (bound) return
    bound = true
    watch(active, (on) => (on ? startScheduler() : stopScheduler()), { immediate: true })
    // The user may flip the OS/browser permission while away — re-check on return.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) syncPermission()
    })
  })

  return {
    permission,
    supported,
    active,
    schedule,
    rhythm,
    requestNotifications,
    sendTestReminder
  }
}
