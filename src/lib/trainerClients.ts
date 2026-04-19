import { apiFetch } from './api'
import type { TrainerClientStatus } from './trainerDashboard'
import { fetchUser, type UserResponse } from './users'

export interface TrainerClientRow {
  id: string
  trainerId: string
  userId: string
  status: TrainerClientStatus
  activeSubscriptionId: string | null
  createdAt: string
  updatedAt: string
}

export interface TrainerClientListResponse {
  data: TrainerClientRow[]
  total: number
  page: number
  limit: number
}

export async function fetchTrainerClients(
  page: number = 1,
  limit: number = 20,
): Promise<TrainerClientListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return apiFetch<TrainerClientListResponse>(
    `/trainers/me/clients?${params.toString()}`,
  )
}

export interface TrainerClientsWithUsers {
  list: TrainerClientListResponse
  usersById: Record<string, UserResponse>
}

/** List trainer clients and resolve each row’s user email (deduped user fetches). */
export async function fetchTrainerClientsWithUsers(
  page: number = 1,
  limit: number = 20,
): Promise<TrainerClientsWithUsers> {
  const list = await fetchTrainerClients(page, limit)
  const uniqueUserIds = [...new Set(list.data.map((c) => c.userId))]
  const users = await Promise.all(
    uniqueUserIds.map((userId) => fetchUser(userId)),
  )
  const usersById = Object.fromEntries(
    uniqueUserIds.map((id, i) => [id, users[i]!]),
  )
  return { list, usersById }
}
