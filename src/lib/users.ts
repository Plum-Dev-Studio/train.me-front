import { apiFetch } from './api'

export interface UserResponse {
  id: string
  email: string
  role: string
  isActive: boolean
  emailVerifiedAt: string | null
  createdAt: string
  updatedAt: string
}

export async function fetchUser(userId: string): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/users/${userId}`)
}
