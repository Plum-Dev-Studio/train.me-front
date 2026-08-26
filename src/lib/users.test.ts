import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchUser, fetchCurrentUser } from './users'
import * as apiModule from './api'

describe('users api helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchUser calls /users/:id', async () => {
    const mockResponse = {
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue(mockResponse)

    const result = await fetchUser('user-1')

    expect(spy).toHaveBeenCalledWith('/users/user-1')
    expect(result).toEqual(mockResponse)
  })

  it('fetchCurrentUser calls /auth/me', async () => {
    const mockResponse = {
      id: 'trainer-1',
      email: 'trainer@example.com',
      role: 'trainer',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue(mockResponse)

    const result = await fetchCurrentUser()

    expect(spy).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(mockResponse)
  })
})
