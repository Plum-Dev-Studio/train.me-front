const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`API error: ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {}

  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const token = localStorage.getItem('auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body)
  }

  return response.json()
}

export interface ApiFetchBlobResult {
  blob: Blob
  contentDisposition: string | null
}

/** Authenticated request expecting a binary body — does not parse JSON on success. */
export async function apiFetchBlob(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiFetchBlobResult> {
  const headers: Record<string, string> = {}

  const token = localStorage.getItem('auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body)
  }

  const contentDisposition = response.headers.get('content-disposition')
  const blob = await response.blob()
  return { blob, contentDisposition }
}
