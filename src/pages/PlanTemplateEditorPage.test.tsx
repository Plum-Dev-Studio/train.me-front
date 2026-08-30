import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PlanTemplateEditorPage from './PlanTemplateEditorPage'
import { fetchExercises } from '@/lib/exercisesApi'
import {
  addBlockToRoutine,
  addExerciseToBlock,
  fetchPlanTemplateTree,
} from '@/lib/planTemplates'
import { createPlanFromTemplate, publishPlan } from '@/lib/plans'
import { fetchTrainerClientsWithUsers } from '@/lib/trainerClients'

vi.mock('@/lib/planTemplates', async () => {
  const actual = await vi.importActual<typeof import('@/lib/planTemplates')>(
    '@/lib/planTemplates',
  )
  return {
    ...actual,
    fetchPlanTemplateTree: vi.fn(),
    addExerciseToBlock: vi.fn(),
    addRoutineToTemplate: vi.fn(),
    addBlockToRoutine: vi.fn(),
  }
})

vi.mock('@/lib/exercisesApi', () => ({
  fetchExercises: vi.fn(),
}))

vi.mock('@/lib/plans', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/plans')>('@/lib/plans')
  return {
    ...actual,
    createPlanFromTemplate: vi.fn(),
    publishPlan: vi.fn(),
  }
})

vi.mock('@/lib/trainerClients', () => ({
  fetchTrainerClientsWithUsers: vi.fn(),
}))

vi.mock('@/contexts/useTrainerDashboard', () => ({
  useTrainerDashboard: vi.fn(() => ({
    data: { trainer: { profileId: 'tr-1' } },
    isSuccess: true,
    isPending: false,
    isError: false,
  })),
}))

function renderEditor() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/app/plantillas/pt-1']}>
        <Routes>
          <Route
            path="/app/plantillas/:templateId"
            element={<PlanTemplateEditorPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const tree = {
  template: {
    id: 'pt-1',
    trainerId: 'tr-1',
    name: 'Fuerza',
    notes: null,
    nutritionTemplate: { dailyCaloriesKcal: 2200 },
    archivedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  routines: [
    {
      id: 'r-1',
      planTemplateId: 'pt-1',
      name: 'Lunes',
      order: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      blocks: [
        {
          id: 'b-1',
          routineTemplateId: 'r-1',
          name: 'Bloque 1',
          order: 0,
          rounds: 1,
          restBetweenRoundsSec: null,
          notes: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          exercises: [],
        },
      ],
    },
  ],
}

describe('PlanTemplateEditorPage', () => {
  beforeEach(() => {
    vi.mocked(fetchPlanTemplateTree).mockResolvedValue(tree)
    vi.mocked(fetchExercises).mockResolvedValue([
      {
        id: 'ex-1',
        name: 'Press banca',
        description: null,
        muscleGroup: 'Pecho',
        isGlobal: true,
        trainerId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ])
    vi.mocked(fetchTrainerClientsWithUsers).mockResolvedValue({
      list: {
        data: [
          {
            id: 'tc-1',
            trainerId: 'tr-1',
            userId: 'user-1',
            status: 'active',
            activeSubscriptionId: 'sub-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      },
      usersById: {
        'user-1': {
          id: 'user-1',
          email: 'cliente@test.com',
          role: 'user',
          isActive: true,
          emailVerifiedAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    })
    vi.mocked(addExerciseToBlock).mockResolvedValue({
      id: 'e-1',
      blockTemplateId: 'b-1',
      exerciseId: 'ex-1',
      order: 0,
      reps: 10,
      weight: null,
      restAfterSec: null,
      notes: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    vi.mocked(createPlanFromTemplate).mockResolvedValue({
      id: 'plan-1',
      trainerId: 'tr-1',
      userId: 'user-1',
      templateId: 'pt-1',
      status: 'draft',
      startDate: null,
      endDate: null,
      notes: null,
      nutrition: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    vi.mocked(publishPlan).mockResolvedValue({
      id: 'plan-1',
      trainerId: 'tr-1',
      userId: 'user-1',
      templateId: 'pt-1',
      status: 'published',
      startDate: null,
      endDate: null,
      notes: null,
      nutrition: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('adds an exercise via POST on the block', async () => {
    renderEditor()

    expect(await screen.findByText('Fuerza')).toBeInTheDocument()
    await userEvent.selectOptions(
      screen.getByLabelText(/Ejercicio para Bloque 1/i),
      'ex-1',
    )
    await userEvent.type(screen.getByLabelText(/Peso para Bloque 1/i), '40')
    await userEvent.type(
      screen.getByLabelText(/Descanso después de Bloque 1/i),
      '90',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Agregar ejercicio' }),
    )

    expect(addExerciseToBlock).toHaveBeenCalledWith('pt-1', 'r-1', 'b-1', {
      exerciseId: 'ex-1',
      order: 0,
      reps: 10,
      weight: 40,
      restAfterSec: 90,
    })
  })

  it('creates a block with name, rounds and rest', async () => {
    vi.mocked(addBlockToRoutine).mockResolvedValue({
      id: 'b-2',
      routineTemplateId: 'r-1',
      name: 'Pecho',
      order: 1,
      rounds: 3,
      restBetweenRoundsSec: 60,
      notes: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderEditor()

    await screen.findByText('Fuerza')
    await userEvent.click(
      screen.getByRole('button', { name: 'Agregar bloque' }),
    )
    await userEvent.type(
      screen.getByLabelText(/Nombre del bloque en Lunes/i),
      'Pecho',
    )
    await userEvent.clear(screen.getByLabelText(/Rounds del bloque en Lunes/i))
    await userEvent.type(
      screen.getByLabelText(/Rounds del bloque en Lunes/i),
      '3',
    )
    await userEvent.type(
      screen.getByLabelText(/Descanso entre rounds en Lunes/i),
      '60',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Crear bloque' }))

    expect(addBlockToRoutine).toHaveBeenCalledWith('pt-1', 'r-1', {
      name: 'Pecho',
      order: 1,
      rounds: 3,
      restBetweenRoundsSec: 60,
    })
  })

  it('assigns and publishes with two POSTs', async () => {
    renderEditor()

    await screen.findByText('Fuerza')
    await userEvent.selectOptions(screen.getByLabelText('Cliente'), 'user-1')
    await userEvent.click(
      screen.getByRole('button', { name: 'Asignar y publicar' }),
    )

    expect(createPlanFromTemplate).toHaveBeenCalledWith({
      trainerId: 'tr-1',
      userId: 'user-1',
      templateId: 'pt-1',
    })
    expect(publishPlan).toHaveBeenCalledWith('plan-1')
    expect(
      await screen.findByText(/Plan asignado y publicado/i),
    ).toBeInTheDocument()
  })
})
