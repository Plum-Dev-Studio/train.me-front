import { useContext } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { TrainerDashboardResponse } from '@/lib/trainerDashboard'
import { TrainerDashboardContext } from './trainerDashboardContextBase'

export function useTrainerDashboard(): UseQueryResult<
  TrainerDashboardResponse,
  Error
> {
  const ctx = useContext(TrainerDashboardContext)
  if (!ctx) {
    throw new Error(
      'useTrainerDashboard must be used within TrainerDashboardProvider',
    )
  }
  return ctx
}
