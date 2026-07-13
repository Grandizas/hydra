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
    customEnd
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

  function fireReminder() {
    const remaining = Math.max(0, goal.value - total.value)
    const tail =
      remaining > 0
        ? `${remaining.toLocaleString()} ml to go today.`
        : 'You have reached your goal — lovely.'
    show('Time to hydrate 💧', `${nextMessage()}\n${tail}`, 'hydra-reminder')
    lastReminderAt = Date.now()
    persistLast()
  }

  // Decides — on each tick — whether a reminder is due.
  function maybeNotify() {
    if (!active.value || goalReached.value) return

    const s = schedule.value
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    if (nowMin < s.startMin || nowMin >= s.endMin) return

    // Reminders are relative to your last drink, so logging water resets the
    // timer. Falls back to when reminders were (re)started.
    const lastEntry = entries.value.length ? entries.value[entries.value.length - 1].t : 0
    const reference = Math.max(lastEntry, lastReminderAt)
    if (Date.now() - reference >= s.intervalMin * 60_000) fireReminder()
  }

  function startScheduler() {
    if (tickTimer) return
    // Don't fire the instant reminders switch on — wait a full interval first.
    if (!lastReminderAt) {
      lastReminderAt = Date.now()
      persistLast()
    }
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
    requestNotifications,
    sendTestReminder
  }
}
