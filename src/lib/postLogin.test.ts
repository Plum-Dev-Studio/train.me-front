import { describe, it, expect, beforeEach } from 'vitest'
import {
  consumePostLoginRedirect,
  homePathForRole,
  resolvePostLoginPath,
  POST_LOGIN_REDIRECT_KEY,
} from './postLogin'

beforeEach(() => {
  localStorage.clear()
})

describe('homePathForRole', () => {
  it('sends trainers to /app', () => {
    expect(homePathForRole('trainer')).toBe('/app')
  })

  it('sends users to /me', () => {
    expect(homePathForRole('user')).toBe('/me')
  })

  it('sends other roles to /', () => {
    expect(homePathForRole('admin')).toBe('/')
  })
})

describe('consumePostLoginRedirect', () => {
  it('returns and clears the stored path', () => {
    localStorage.setItem(POST_LOGIN_REDIRECT_KEY, '/entrenadores/t-1')
    expect(consumePostLoginRedirect()).toBe('/entrenadores/t-1')
    expect(localStorage.getItem(POST_LOGIN_REDIRECT_KEY)).toBeNull()
  })

  it('returns null when nothing is stored', () => {
    expect(consumePostLoginRedirect()).toBeNull()
  })
})

describe('resolvePostLoginPath', () => {
  it('prefers post_login_redirect over role home', async () => {
    localStorage.setItem(POST_LOGIN_REDIRECT_KEY, '/entrenadores/t-1')
    const path = await resolvePostLoginPath(async () => ({ role: 'trainer' }))
    expect(path).toBe('/entrenadores/t-1')
  })

  it('uses role home when there is no stored redirect', async () => {
    const path = await resolvePostLoginPath(async () => ({ role: 'trainer' }))
    expect(path).toBe('/app')
  })
})
