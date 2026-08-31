import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  fetchTrainerClients,
  fetchTrainerClientsWithUsers,
  updateTrainerClientNotes,
  fetchTrainerClientPlans,
} from './trainerClients'
import * as apiModule from './api'
import * as usersModule from './users'

describe('fetchTrainerClients', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('GETs /trainers/me/clients with pagination', async () => {
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    })

    await fetchTrainerClients(2, 10)

    expect(apiModule.apiFetch).toHaveBeenCalledWith(
      '/trainers/me/clients?page=2&limit=10',
    )
  })
})

describe('updateTrainerClientNotes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('PATCHes trainerNotes on the client row', async () => {
    const row = {
      id: 'tc-1',
      trainerId: 'tr-1',
      userId: 'u-1',
      status: 'active' as const,
      activeSubscriptionId: null,
      trainerNotes: 'Focus mobility',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue(row)

    const result = await updateTrainerClientNotes('tc-1', 'Focus mobility')

    expect(apiModule.apiFetch).toHaveBeenCalledWith(
      '/trainers/me/clients/tc-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ trainerNotes: 'Focus mobility' }),
      },
    )
    expect(result.trainerNotes).toBe('Focus mobility')
  })

  it('sends null when notes are cleared', async () => {
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({})

    await updateTrainerClientNotes('tc-1', null)

    expect(apiModule.apiFetch).toHaveBeenCalledWith(
      '/trainers/me/clients/tc-1',
      {
        method: 'PATCH',
        body: JSON.stringify({ trainerNotes: null }),
      },
    )
  })
})

describe('fetchTrainerClientPlans', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('GETs plans for a trainer client', async () => {
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue([])

    await fetchTrainerClientPlans('tc-abc')

    expect(apiModule.apiFetch).toHaveBeenCalledWith(
      '/trainers/me/clients/tc-abc/plans',
    )
  })
})

describe('fetchTrainerClientsWithUsers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('dedupes user fetches', async () => {
    vi.spyOn(apiModule, 'apiFetch').mockResolvedValue({
      data: [
        {
          id: 'tc-1',
          trainerId: 'tr-1',
          userId: 'u-1',
          status: 'active',
          activeSubscriptionId: null,
          trainerNotes: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'tc-2',
          trainerId: 'tr-1',
          userId: 'u-1',
          status: 'pending',
          activeSubscriptionId: null,
          trainerNotes: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
    })
    vi.spyOn(usersModule, 'fetchUser').mockResolvedValue({
      id: 'u-1',
      email: 'a@test.com',
      role: 'user',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    const result = await fetchTrainerClientsWithUsers()

    expect(usersModule.fetchUser).toHaveBeenCalledTimes(1)
    expect(result.usersById['u-1']?.email).toBe('a@test.com')
  })
})
