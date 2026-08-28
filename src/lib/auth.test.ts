import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register, login } from './auth'

const API_BASE = '/api'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('register', () => {
  it('should call POST /auth/register with correct body', async () => {
    const mockResponse = { message: 'Verification email sent' }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    )

    const result = await register({
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
    })

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/auth/register`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'John Doe',
        }),
      }),
    )
    expect(result).toEqual(mockResponse)
  })
})

describe('login', () => {
  it('should call POST /auth/login with correct body', async () => {
    const mockResponse = { accessToken: 'jwt-token', expiresIn: 604800 }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    )

    const result = await login({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(fetch).toHaveBeenCalledWith(
      `${API_BASE}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      }),
    )
    expect(result).toEqual(mockResponse)
  })
})
