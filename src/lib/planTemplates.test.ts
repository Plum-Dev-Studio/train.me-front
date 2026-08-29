import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchPlanTemplates,
  createPlanTemplate,
  addRoutineToTemplate,
  addBlockToRoutine,
  addExerciseToBlock,
  nextOrder,
  suggestedRoutineName,
} from './planTemplates'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  localStorage.clear()
  mockFetch.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function okJson(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  }
}

describe('nextOrder', () => {
  it('returns 0 for empty list', () => {
    expect(nextOrder([])).toBe(0)
  })

  it('returns max + 1', () => {
    expect(nextOrder([{ order: 0 }, { order: 2 }])).toBe(3)
  })
})

describe('suggestedRoutineName', () => {
  it('maps 0 to Lunes', () => {
    expect(suggestedRoutineName(0)).toBe('Lunes')
  })
})

describe('fetchPlanTemplates', () => {
  it('GETs /plans/templates?trainerId=', async () => {
    mockFetch.mockResolvedValue(okJson([]))

    await fetchPlanTemplates('tr-1')

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plans/templates?trainerId=tr-1',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
  })
})

describe('createPlanTemplate', () => {
  it('POSTs nutritionTemplate copied from the preset', async () => {
    const created = {
      id: 'pt-1',
      trainerId: 'tr-1',
      name: 'Fuerza',
      notes: null,
      nutritionTemplate: { dailyCaloriesKcal: 2200 },
      archivedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    mockFetch.mockResolvedValue(okJson(created))

    const result = await createPlanTemplate({
      trainerId: 'tr-1',
      name: 'Fuerza',
      nutritionTemplate: { dailyCaloriesKcal: 2200, proteinG: 150 },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plans/templates',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          trainerId: 'tr-1',
          name: 'Fuerza',
          nutritionTemplate: { dailyCaloriesKcal: 2200, proteinG: 150 },
        }),
      }),
    )
    expect(result.id).toBe('pt-1')
  })
})

describe('template nested POSTs', () => {
  it('adds a routine, block and exercise on nested paths', async () => {
    mockFetch
      .mockResolvedValueOnce(
        okJson({
          id: 'r-1',
          planTemplateId: 'pt-1',
          name: 'Lunes',
          order: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(
        okJson({
          id: 'b-1',
          routineTemplateId: 'r-1',
          name: 'Bloque 1',
          order: 0,
          rounds: 1,
          restBetweenRoundsSec: null,
          notes: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(
        okJson({
          id: 'e-1',
          blockTemplateId: 'b-1',
          exerciseId: 'ex-1',
          order: 0,
          reps: 10,
          weight: null,
          restAfterSec: null,
          notes: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      )

    await addRoutineToTemplate('pt-1', { name: 'Lunes', order: 0 })
    await addBlockToRoutine('pt-1', 'r-1', {
      name: 'Bloque 1',
      order: 0,
      rounds: 1,
    })
    await addExerciseToBlock('pt-1', 'r-1', 'b-1', {
      exerciseId: 'ex-1',
      order: 0,
      reps: 10,
    })

    expect(mockFetch.mock.calls[0][0]).toBe(
      '/api/plans/templates/pt-1/routines',
    )
    expect(mockFetch.mock.calls[1][0]).toBe(
      '/api/plans/templates/pt-1/routines/r-1/blocks',
    )
    expect(mockFetch.mock.calls[2][0]).toBe(
      '/api/plans/templates/pt-1/routines/r-1/blocks/b-1/exercises',
    )
  })
})
