import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createExercise,
  deleteExercise,
  fetchExercises,
  updateExercise,
} from './exercisesApi'
import { ApiError } from './api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const exercise = {
  id: 'ex-1',
  name: 'Press banca',
  description: 'Barra plana',
  muscleGroup: 'Pecho',
  isGlobal: false,
  trainerId: 'tr-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  localStorage.clear()
  mockFetch.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchExercises', () => {
  it('GETs /exercises without trainer filter', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([exercise]),
    })

    const result = await fetchExercises()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/exercises',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
    expect(result).toEqual([exercise])
  })

  it('GETs /exercises with trainerId query', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([exercise]),
    })

    await fetchExercises('tr-1')

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/exercises?trainerId=tr-1',
      expect.any(Object),
    )
  })
})

describe('createExercise', () => {
  it('POSTs /exercises with body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(exercise),
    })

    const result = await createExercise({
      name: 'Press banca',
      description: 'Barra plana',
      muscleGroup: 'Pecho',
      isGlobal: false,
      trainerId: 'tr-1',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/exercises',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Press banca',
          description: 'Barra plana',
          muscleGroup: 'Pecho',
          isGlobal: false,
          trainerId: 'tr-1',
        }),
      }),
    )
    expect(result).toEqual(exercise)
  })
})

describe('updateExercise', () => {
  it('PATCHes /exercises/:id', async () => {
    const updated = { ...exercise, name: 'Press inclinado' }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updated),
    })

    const result = await updateExercise('ex-1', { name: 'Press inclinado' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/exercises/ex-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Press inclinado' }),
      }),
    )
    expect(result).toEqual(updated)
  })
})

describe('deleteExercise', () => {
  it('DELETEs /exercises/:id without parsing body', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 204 })

    await deleteExercise('ex-1')

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/exercises/ex-1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('throws ApiError on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
    })

    await expect(deleteExercise('missing')).rejects.toBeInstanceOf(ApiError)
  })
})
