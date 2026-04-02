import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardContent } from './DashboardPage'
import type { TrainerDashboardResponse } from '@/lib/trainerDashboard'

const sampleDashboard: TrainerDashboardResponse = {
  trainer: {
    profileId: 'p1',
    displayName: 'María López',
    greetingName: 'María',
  },
  stats: {
    activeClients: 3,
    newClientsThisWeek: 1,
    activePlans: 2,
    plansCreatedThisMonth: 0,
    activeSubscriptions: 4,
    totalExercises: 10,
    customExercises: 2,
  },
  recentClients: [
    {
      trainerClientId: 'tc1',
      userId: 'u1',
      fullName: 'Cliente Uno',
      email: 'uno@test.com',
      planName: 'Plan A',
      status: 'active',
      planType: 'monthly',
      updatedAt: '2026-04-01T12:00:00.000Z',
    },
    {
      trainerClientId: 'tc2',
      userId: 'u2',
      fullName: 'Cliente Dos',
      email: 'dos@test.com',
      planName: null,
      status: 'canceled',
      planType: null,
      updatedAt: '2026-04-01T12:00:00.000Z',
    },
  ],
}

describe('DashboardContent', () => {
  it('renders greeting and stats from API-shaped data', () => {
    render(<DashboardContent data={sampleDashboard} />)

    expect(
      screen.getByRole('heading', { name: /Buen día, María/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('+1 esta semana')).toBeInTheDocument()
    expect(screen.getByText('Cliente Uno')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
    expect(screen.getByText('Mensual')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state when there are no recent clients', () => {
    const empty: TrainerDashboardResponse = {
      ...sampleDashboard,
      recentClients: [],
    }
    render(<DashboardContent data={empty} />)

    expect(
      screen.getByText(/Todavía no tenés clientes recientes/i),
    ).toBeInTheDocument()
  })
})
