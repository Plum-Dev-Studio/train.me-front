import { apiFetch } from './api'

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

export async function fetchExercises(
  trainerId?: string,
): Promise<ExerciseDto[]> {
  const q = trainerId?.trim()
  const path = q
    ? `/exercises?trainerId=${encodeURIComponent(q)}`
    : '/exercises'
  return apiFetch<ExerciseDto[]>(path)
}
