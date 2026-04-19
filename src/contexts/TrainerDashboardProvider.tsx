import { type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DEFAULT_DASHBOARD_RECENT_LIMIT,
  fetchTrainerDashboard,
  trainerDashboardQueryKey,
} from '@/lib/trainerDashboard'
import { TrainerDashboardContext } from './trainerDashboardContextBase'

export function TrainerDashboardProvider({
  children,
}: {
  children: ReactNode
}) {
  const recentLimit = DEFAULT_DASHBOARD_RECENT_LIMIT
  const query = useQuery({
    queryKey: trainerDashboardQueryKey(recentLimit),
    queryFn: () => fetchTrainerDashboard(recentLimit),
  })

  return (
    <TrainerDashboardContext.Provider value={query}>
      {children}
    </TrainerDashboardContext.Provider>
  )
}
