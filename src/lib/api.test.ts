import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiFetch, apiFetchBlob, ApiError } from './api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  localStorage.clear()
  mockFetch.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('apiFetch', () => {
  it('makes a GET request with JSON content-type', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })

    const result = await apiFetch('/users')

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
    expect(result).toEqual({ id: 1 })
  })

  it('sends Authorization header when token exists', async () => {
    localStorage.setItem('auth_token', 'my-token')
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await apiFetch('/me')

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      }),
    )
  })

  it('does not send Authorization header when no token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await apiFetch('/public')

    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers).not.toHaveProperty('Authorization')
  })

  it('skips Content-Type for FormData body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const formData = new FormData()
    formData.append('file', 'test')
    await apiFetch('/upload', { method: 'POST', body: formData })

    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers).not.toHaveProperty('Content-Type')
  })

  it('throws ApiError with status and parsed body on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ message: 'Validation failed' }),
    })

    try {
      await apiFetch('/users')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      const apiError = error as ApiError
      expect(apiError.status).toBe(422)
      expect(apiError.body).toEqual({ message: 'Validation failed' })
    }
  })

  it('throws ApiError with null body when response body is not JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    })

    try {
      await apiFetch('/crash')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      const apiError = error as ApiError
      expect(apiError.status).toBe(500)
      expect(apiError.body).toBeNull()
    }
  })

  it('allows overriding headers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await apiFetch('/custom', {
      headers: { 'X-Custom': 'value' },
    })

    const headers = mockFetch.mock.calls[0][1].headers
    expect(headers['X-Custom']).toBe('value')
    expect(headers['Content-Type']).toBe('application/json')
  })
})

describe('apiFetchBlob', () => {
  it('returns blob and Content-Disposition with Authorization', async () => {
    localStorage.setItem('auth_token', 'blob-token')
    const pdfBlob = new Blob(['%PDF-1'], { type: 'application/pdf' })
    mockFetch.mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) =>
          name.toLowerCase() === 'content-disposition'
            ? 'attachment; filename="plan-abc.pdf"'
            : null,
      },
      blob: () => Promise.resolve(pdfBlob),
    })

    const result = await apiFetchBlob('/plans/abc/pdf')

    expect(result.blob).toBe(pdfBlob)
    expect(result.contentDisposition).toContain('plan-abc.pdf')
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/plans/abc/pdf',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer blob-token',
        }),
      }),
    )
  })

  it('throws ApiError on non-OK without consuming body as JSON requirement', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    })

    try {
      await apiFetchBlob('/plans/missing/pdf')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(404)
    }
  })
})
