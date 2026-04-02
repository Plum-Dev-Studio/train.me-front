import { apiFetch } from './api'
import { fetchUser, type UserResponse } from './users'

export type PlanLifecycleStatus = 'draft' | 'published' | 'archived'

export interface PlanDto {
  id: string
  trainerId: string
  userId: string
  templateId: string | null
  status: PlanLifecycleStatus
  startDate: string | null
  endDate: string | null
  notes: string | null
  nutrition: unknown | null
  createdAt: string
  updatedAt: string
}

export function planStatusLabel(status: PlanLifecycleStatus): string {
  switch (status) {
    case 'draft':
      return 'Borrador'
    case 'published':
      return 'Publicado'
    case 'archived':
      return 'Archivado'
    default:
      return status
  }
}

export async function fetchPlansByTrainer(
  trainerProfileId: string,
): Promise<PlanDto[]> {
  const params = new URLSearchParams({
    trainerId: trainerProfileId,
  })
  return apiFetch<PlanDto[]>(`/plans?${params.toString()}`)
}

export interface PlansWithUsers {
  plans: PlanDto[]
  usersById: Record<string, UserResponse>
}

export async function fetchPlansWithUserEmails(
  trainerProfileId: string,
): Promise<PlansWithUsers> {
  const plans = await fetchPlansByTrainer(trainerProfileId)
  const uniqueUserIds = [...new Set(plans.map((p) => p.userId))]
  const users = await Promise.all(
    uniqueUserIds.map((userId) => fetchUser(userId)),
  )
  const usersById = Object.fromEntries(
    uniqueUserIds.map((id, i) => [id, users[i]!]),
  )
  return { plans, usersById }
}
