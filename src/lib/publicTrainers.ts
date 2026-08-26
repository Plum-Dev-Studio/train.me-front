import { apiFetch } from './api'

export interface PublicTrainerProfile {
  id: string
  displayName: string
  bio: string | null
  experienceYears: number | null
  monthlyPrice: number | null
  specialties: string[]
}

export interface PublicTrainerListResponse {
  data: PublicTrainerProfile[]
  total: number
  page: number
  limit: number
}

export interface SearchPublicTrainersParams {
  q?: string
  specialty?: string
  minExperienceYears?: number
  maxMonthlyPrice?: number
  page?: number
  limit?: number
}

export async function searchPublicTrainers(
  params: SearchPublicTrainersParams,
): Promise<PublicTrainerListResponse> {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.specialty) query.set('specialty', params.specialty)
  if (params.minExperienceYears !== undefined) {
    query.set('minExperienceYears', String(params.minExperienceYears))
  }
  if (params.maxMonthlyPrice !== undefined) {
    query.set('maxMonthlyPrice', String(params.maxMonthlyPrice))
  }
  query.set('page', String(params.page ?? 1))
  query.set('limit', String(params.limit ?? 20))

  return apiFetch<PublicTrainerListResponse>(
    `/trainers/profiles/public/search?${query.toString()}`,
  )
}

export async function getPublicTrainerProfile(
  trainerId: string,
): Promise<PublicTrainerProfile> {
  return apiFetch<PublicTrainerProfile>(
    `/trainers/profiles/public/${trainerId}`,
  )
}
