import { apiFetch } from './api'

export type TrainerClientStatus = 'pending' | 'active' | 'canceled' | 'expired'

export interface TrainerDashboardRecentClient {
  trainerClientId: string
  userId: string
  fullName: string
  email: string
  planName: string | null
  status: TrainerClientStatus
  planType: 'monthly' | 'annual' | null
  updatedAt: string
}

export interface TrainerDashboardResponse {
  trainer: {
    profileId: string
    displayName: string
    greetingName: string
  }
  stats: {
    activeClients: number
    newClientsThisWeek: number
    activePlans: number
    plansCreatedThisMonth: number
    activeSubscriptions: number
    totalExercises: number
    customExercises: number
  }
  recentClients: TrainerDashboardRecentClient[]
}

export const DEFAULT_DASHBOARD_RECENT_LIMIT = 10

export function trainerDashboardQueryKey(recentLimit: number) {
  return ['trainerDashboard', recentLimit] as const
}

export async function fetchTrainerDashboard(
  recentLimit: number = DEFAULT_DASHBOARD_RECENT_LIMIT,
): Promise<TrainerDashboardResponse> {
  const params = new URLSearchParams({
    recentLimit: String(recentLimit),
  })
  return apiFetch<TrainerDashboardResponse>(
    `/trainers/me/dashboard?${params.toString()}`,
  )
}

/** Up to two initials from the first words of a display name. */
export function initialsFromFullName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase()
  }
  return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase()
}

export type UiClientStatus = 'active' | 'pending' | 'expired' | 'canceled'

export function mapTrainerClientStatus(status: TrainerClientStatus): {
  ui: UiClientStatus
  label: string
} {
  switch (status) {
    case 'active':
      return { ui: 'active', label: 'Activo' }
    case 'pending':
      return { ui: 'pending', label: 'Pendiente' }
    case 'expired':
      return { ui: 'expired', label: 'Vencido' }
    case 'canceled':
      return { ui: 'canceled', label: 'Cancelado' }
  }
}

export function planTypeLabel(planType: 'monthly' | 'annual' | null): string {
  if (planType === 'monthly') return 'Mensual'
  if (planType === 'annual') return 'Anual'
  return '—'
}
