/** Plan convention: 0 = lunes … 6 = domingo. JS `getDay()`: 0 = domingo. */

const DAY_TOKENS: Array<[string, number]> = [
  ['miercoles', 2],
  ['wednesday', 2],
  ['thursday', 3],
  ['saturday', 5],
  ['tuesday', 1],
  ['friday', 4],
  ['monday', 0],
  ['sunday', 6],
  ['domingo', 6],
  ['viernes', 4],
  ['jueves', 3],
  ['martes', 1],
  ['sabado', 5],
  ['lunes', 0],
  ['wed', 2],
  ['thu', 3],
  ['sat', 5],
  ['sun', 6],
  ['mon', 0],
  ['tue', 1],
  ['fri', 4],
  ['lun', 0],
  ['mar', 1],
  ['mie', 2],
  ['jue', 3],
  ['vie', 4],
  ['sab', 5],
  ['dom', 6],
]

export const WEEKDAY_LABELS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const

export function mondayIndexFromJsGetDay(jsGetDay: number): number {
  return (jsGetDay + 6) % 7
}

export function todayMondayIndex(now: Date = new Date()): number {
  return mondayIndexFromJsGetDay(now.getDay())
}

function normalizeDayText(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

/** Name wins over `order` when it parses a weekday. */
export function weekdayIndexFromRoutineName(name: string): number | null {
  const normalized = normalizeDayText(name)
  for (const [token, index] of DAY_TOKENS) {
    const pattern = new RegExp(`(^|[^a-z])${token}([^a-z]|$)`)
    if (pattern.test(normalized)) {
      return index
    }
  }
  return null
}

export function weekdayIndexForRoutine(routine: {
  name: string
  order: number
}): number {
  const fromName = weekdayIndexFromRoutineName(routine.name)
  if (fromName !== null) return fromName
  return ((routine.order % 7) + 7) % 7
}

export function routinesForWeekday<T extends { name: string; order: number }>(
  routines: T[],
  weekdayIndex: number,
): T[] {
  return routines
    .filter((routine) => weekdayIndexForRoutine(routine) === weekdayIndex)
    .sort((a, b) => a.order - b.order)
}

export function sortRoutinesByOrder<T extends { order: number }>(
  routines: T[],
): T[] {
  return [...routines].sort((a, b) => a.order - b.order)
}
