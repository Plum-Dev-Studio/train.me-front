import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchPlanTemplates,
  createPlanTemplate,
  addRoutineToTemplate,
  addBlockToRoutine,
  addExerciseToBlock,
  updateBlockTemplate,
  updateBlockExercise,
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

  it('POSTs block with restBetweenRoundsSec and exercise with weight/rest/notes', async () => {
    mockFetch
      .mockResolvedValueOnce(
        okJson({
          id: 'b-2',
          routineTemplateId: 'r-1',
          name: 'Pecho',
          order: 1,
          rounds: 3,
          restBetweenRoundsSec: 60,
          notes: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      )
      .mockResolvedValueOnce(
        okJson({
          id: 'e-2',
          blockTemplateId: 'b-2',
          exerciseId: 'ex-1',
          order: 0,
          reps: 10,
          weight: 40,
          restAfterSec: 90,
          notes: 'por lado',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }),
      )

    await addBlockToRoutine('pt-1', 'r-1', {
      name: 'Pecho',
      order: 1,
      rounds: 3,
      restBetweenRoundsSec: 60,
    })
    await addExerciseToBlock('pt-1', 'r-1', 'b-2', {
      exerciseId: 'ex-1',
      order: 0,
      reps: 10,
      weight: 40,
      restAfterSec: 90,
      notes: 'por lado',
    })

    expect(JSON.parse(mockFetch.mock.calls[0][1].body as string)).toEqual({
      name: 'Pecho',
      order: 1,
      rounds: 3,
      restBetweenRoundsSec: 60,
    })
    expect(JSON.parse(mockFetch.mock.calls[1][1].body as string)).toEqual({
      exerciseId: 'ex-1',
      order: 0,
      reps: 10,
      weight: 40,
      restAfterSec: 90,
      notes: 'por lado',
    })
  })
})

describe('template PATCH helpers', () => {
  it('PATCHes block name, rounds and rest', async () => {
    mockFetch.mockResolvedValue(
      okJson({
        id: 'b-1',
        routineTemplateId: 'r-1',
        name: 'Pecho',
        order: 0,
        rounds: 3,
        restBetweenRoundsSec: 60,
        notes: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    )

    await updateBlockTemplate('pt-1', 'r-1', 'b-1', {
      name: 'Pecho',
      rounds: 3,
      restBetweenRoundsSec: 60,
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plans/templates/pt-1/routines/r-1/blocks/b-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Pecho',
          rounds: 3,
          restBetweenRoundsSec: 60,
        }),
      }),
    )
  })

  it('PATCHes exercise reps, weight, rest and notes', async () => {
    mockFetch.mockResolvedValue(
      okJson({
        id: 'e-1',
        blockTemplateId: 'b-1',
        exerciseId: 'ex-1',
        order: 0,
        reps: 12,
        weight: 50,
        restAfterSec: 120,
        notes: 'por lado',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    )

    await updateBlockExercise('pt-1', 'r-1', 'b-1', 'e-1', {
      reps: 12,
      weight: 50,
      restAfterSec: 120,
      notes: 'por lado',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plans/templates/pt-1/routines/r-1/blocks/b-1/exercises/e-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          reps: 12,
          weight: 50,
          restAfterSec: 120,
          notes: 'por lado',
        }),
      }),
    )
  })
})
