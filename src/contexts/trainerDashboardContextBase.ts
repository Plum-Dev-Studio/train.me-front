import { createContext } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { TrainerDashboardResponse } from '@/lib/trainerDashboard'

export const TrainerDashboardContext = createContext<UseQueryResult<
  TrainerDashboardResponse,
  Error
> | null>(null)
