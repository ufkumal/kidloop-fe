import type { DailyPlanActivity } from '@/lib/types/daily-plan'

const SELECTED_ACTIVITY_KEY = 'kidloop.daily-plan.selected-activity'

interface StoredSelectedActivity {
  childId: string
  activity: DailyPlanActivity
}

function isBrowser() {
  return typeof window !== 'undefined'
}

/** Seçim yanıtındaki etkinliği yalnızca mevcut tarayıcı sekmesi boyunca saklar. */
export function writeSelectedActivity(childId: string, activity: DailyPlanActivity) {
  if (!isBrowser()) return
  try {
    const value: StoredSelectedActivity = { childId, activity }
    window.sessionStorage.setItem(SELECTED_ACTIVITY_KEY, JSON.stringify(value))
  } catch {
    /* Kota veya gizli mod hatalarında seçim isteğinin sonucunu bozma. */
  }
}

export function readSelectedActivity(childId: string): DailyPlanActivity | null {
  if (!isBrowser()) return null
  try {
    const raw = window.sessionStorage.getItem(SELECTED_ACTIVITY_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as Partial<StoredSelectedActivity>
    const activity = stored.activity as Partial<DailyPlanActivity> | undefined

    if (
      stored.childId !== childId ||
      !activity ||
      typeof activity.activityId !== 'number' ||
      typeof activity.title !== 'string' ||
      typeof activity.description !== 'string' ||
      !Array.isArray(activity.materials) ||
      !Array.isArray(activity.steps) ||
      !Array.isArray(activity.outcomes)
    ) {
      return null
    }

    return activity as DailyPlanActivity
  } catch {
    return null
  }
}
