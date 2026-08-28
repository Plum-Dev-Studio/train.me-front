import { apiFetch, apiFetchBlob } from './api'
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

export async function fetchMyPlans(): Promise<PlanDto[]> {
  return apiFetch<PlanDto[]>('/plans')
}

export function pickUserFacingPlan(plans: PlanDto[]): PlanDto | null {
  if (plans.length === 0) return null
  const published = plans.filter((plan) => plan.status === 'published')
  const pool = published.length > 0 ? published : plans
  return (
    [...pool].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0] ?? null
  )
}

export interface SnapshotExerciseNode {
  id: string
  exerciseId: string
  order: number
  reps: number
  weight?: number
  restAfterSec?: number
  notes?: string
}

export interface SnapshotBlockNode {
  id: string
  name: string
  order: number
  rounds: number
  restBetweenRoundsSec?: number
  notes?: string
  exercises: SnapshotExerciseNode[]
}

export interface SnapshotRoutineNode {
  id: string
  name: string
  order: number
  blocks: SnapshotBlockNode[]
}

export interface SnapshotNutrition {
  dailyCaloriesKcal?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
  notes?: string
  meals?: Array<{
    name?: string
    caloriesKcal?: number
    proteinG?: number
    carbsG?: number
    fatG?: number
    notes?: string
  }>
}

export interface PlanSnapshotDto {
  id: string
  planId: string
  payload: {
    routines: SnapshotRoutineNode[]
    nutrition: SnapshotNutrition | null
    takenAt: string
  }
  createdAt: string
}

export async function fetchPlanSnapshot(
  planId: string,
): Promise<PlanSnapshotDto> {
  return apiFetch<PlanSnapshotDto>(
    `/plans/${encodeURIComponent(planId)}/snapshot`,
  )
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

/** Parse filename from Content-Disposition (RFC 5987 filename* or quoted filename). */
export function filenameFromContentDisposition(
  header: string | null,
): string | null {
  if (!header) return null
  const star = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header)
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ''))
    } catch {
      return star[1].trim().replace(/^["']|["']$/g, '')
    }
  }
  const plain = /filename="([^"]+)"/i.exec(header)
  if (plain?.[1]) return plain[1]
  const plain2 = /filename=([^;\s]+)/i.exec(header)
  return plain2?.[1]?.replace(/^["']|["']$/g, '') ?? null
}

export type PlanPdfSection = 'full' | 'exercises' | 'nutrition'

/**
 * Download plan PDF via GET /plans/:id/pdf (same auth as apiFetch).
 * Uses object URL + temporary anchor; revokes URL after click.
 */
export async function downloadPlanPdf(
  planId: string,
  section: PlanPdfSection = 'full',
): Promise<void> {
  const params =
    section === 'full' ? '' : `?section=${encodeURIComponent(section)}`
  const endpoint = `/plans/${encodeURIComponent(planId)}/pdf${params}`
  const { blob, contentDisposition } = await apiFetchBlob(endpoint, {
    method: 'GET',
  })

  const fromHeader = filenameFromContentDisposition(contentDisposition)
  const filename = fromHeader ?? `plan-${planId}.pdf`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
