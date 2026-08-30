import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  fetchTrainerProfileByUserId,
  registerAsTrainer,
} from './trainerProfiles'
import * as apiModule from './api'

describe('trainerProfiles api helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchTrainerProfileByUserId calls GET /trainers/profiles/:userId', async () => {
    const mockResponse = {
      id: 'tp-1',
      userId: 'user-1',
      displayName: 'Coach',
      bio: null,
      experienceYears: null,
      monthlyPrice: null,
      certifications: null,
      isPublic: true,
      contactWhatsapp: null,
      contactEmail: null,
      contactInstagram: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue(mockResponse)

    const result = await fetchTrainerProfileByUserId('user-1')

    expect(spy).toHaveBeenCalledWith('/trainers/profiles/user-1')
    expect(result).toEqual(mockResponse)
  })

  it('registerAsTrainer POSTs /trainers/profiles/me/register', async () => {
    const mockResponse = {
      id: 'tp-1',
      userId: 'user-1',
      displayName: 'Coach',
      bio: null,
      experienceYears: null,
      monthlyPrice: null,
      certifications: null,
      isPublic: true,
      contactWhatsapp: null,
      contactEmail: null,
      contactInstagram: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const spy = vi.spyOn(apiModule, 'apiFetch').mockResolvedValue(mockResponse)

    const result = await registerAsTrainer()

    expect(spy).toHaveBeenCalledWith('/trainers/profiles/me/register', {
      method: 'POST',
    })
    expect(result).toEqual(mockResponse)
  })
})
