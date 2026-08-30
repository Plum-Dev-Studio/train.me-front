import { apiFetch } from './api'

export interface TrainerReviewItem {
  id: string
  rating: number
  comment: string | null
  reviewerDisplayName: string
  createdAt: string
}

export interface PublicTrainerReviewsResponse {
  averageRating: number | null
  reviewCount: number
  data: TrainerReviewItem[]
  total: number
  page: number
  limit: number
}

export interface MyTrainerReview {
  id: string
  trainerId: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
}

export interface UpsertTrainerReviewInput {
  rating: number
  comment?: string | null
}

export async function fetchPublicTrainerReviews(
  trainerId: string,
  page = 1,
  limit = 10,
): Promise<PublicTrainerReviewsResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return apiFetch<PublicTrainerReviewsResponse>(
    `/trainers/profiles/public/${trainerId}/reviews?${query.toString()}`,
  )
}

export async function upsertMyTrainerReview(
  trainerId: string,
  input: UpsertTrainerReviewInput,
): Promise<MyTrainerReview> {
  return apiFetch<MyTrainerReview>(
    `/trainers/profiles/public/${trainerId}/reviews/me`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
}
