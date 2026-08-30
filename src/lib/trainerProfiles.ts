import { apiFetch } from './api'

export interface TrainerProfileResponse {
  id: string
  userId: string
  displayName: string
  bio: string | null
  experienceYears: number | null
  monthlyPrice: number | null
  certifications: string[] | null
  isPublic: boolean
  contactWhatsapp: string | null
  contactEmail: string | null
  contactInstagram: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateTrainerProfileInput {
  displayName?: string
  bio?: string | null
  experienceYears?: number | null
  monthlyPrice?: number | null
  certifications?: string[] | null
  isPublic?: boolean
  contactWhatsapp?: string | null
  contactEmail?: string | null
  contactInstagram?: string | null
}

export async function fetchTrainerProfileByUserId(
  userId: string,
): Promise<TrainerProfileResponse> {
  return apiFetch<TrainerProfileResponse>(`/trainers/profiles/${userId}`)
}

export async function updateTrainerProfileByUserId(
  userId: string,
  input: UpdateTrainerProfileInput,
): Promise<TrainerProfileResponse> {
  return apiFetch<TrainerProfileResponse>(`/trainers/profiles/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function registerAsTrainer(): Promise<TrainerProfileResponse> {
  return apiFetch<TrainerProfileResponse>('/trainers/profiles/me/register', {
    method: 'POST',
  })
}
