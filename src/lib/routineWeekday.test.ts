import { describe, it, expect } from 'vitest'
import {
  mondayIndexFromJsGetDay,
  weekdayIndexFromRoutineName,
  weekdayIndexForRoutine,
  routinesForWeekday,
} from './routineWeekday'

describe('mondayIndexFromJsGetDay', () => {
  it('maps JS Sunday (0) to domingo (6)', () => {
    expect(mondayIndexFromJsGetDay(0)).toBe(6)
  })

  it('maps JS Monday (1) to lunes (0)', () => {
    expect(mondayIndexFromJsGetDay(1)).toBe(0)
  })
})

describe('weekdayIndexFromRoutineName', () => {
  it('parses Spanish and English day names', () => {
    expect(weekdayIndexFromRoutineName('Lunes fuerza')).toBe(0)
    expect(weekdayIndexFromRoutineName('Miércoles')).toBe(2)
    expect(weekdayIndexFromRoutineName('Friday HIIT')).toBe(4)
  })

  it('returns null when no day is in the name', () => {
    expect(weekdayIndexFromRoutineName('Upper Body')).toBeNull()
  })
})

describe('weekdayIndexForRoutine', () => {
  it('prefers the parsed name over order', () => {
    expect(weekdayIndexForRoutine({ name: 'Martes', order: 0 })).toBe(1)
  })

  it('falls back to order % 7', () => {
    expect(weekdayIndexForRoutine({ name: 'Upper Body', order: 0 })).toBe(0)
    expect(weekdayIndexForRoutine({ name: 'Extra', order: 8 })).toBe(1)
  })
})

describe('routinesForWeekday', () => {
  it('keeps extras that land on today via order % 7 in that day filter', () => {
    const routines = [
      { name: 'Lunes A', order: 0 },
      { name: 'Extra', order: 7 },
    ]
    expect(routinesForWeekday(routines, 0)).toHaveLength(2)
  })
})
