import { apiFetch, ApiError } from './api'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export interface ExerciseDto {
  id: string
  name: string
  description: string | null
  muscleGroup: string | null
  isGlobal: boolean
  trainerId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateExerciseInput {
  name: string
  description?: string
  muscleGroup?: string
  isGlobal?: boolean
  trainerId?: string
}

export interface UpdateExerciseInput {
  name?: string
  description?: string | null
  muscleGroup?: string | null
}

export async function fetchExercises(
  trainerId?: string,
): Promise<ExerciseDto[]> {
  const q = trainerId?.trim()
  const path = q
    ? `/exercises?trainerId=${encodeURIComponent(q)}`
    : '/exercises'
  return apiFetch<ExerciseDto[]>(path)
}

export async function createExercise(
  input: CreateExerciseInput,
): Promise<ExerciseDto> {
  return apiFetch<ExerciseDto>('/exercises', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateExercise(
  id: string,
  input: UpdateExerciseInput,
): Promise<ExerciseDto> {
  return apiFetch<ExerciseDto>(`/exercises/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteExercise(id: string): Promise<void> {
  const headers: Record<string, string> = {}
  const token = localStorage.getItem('auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE}/exercises/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers,
    },
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body)
  }
}
