import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ExercisesPage from './ExercisesPage'
import {
  createExercise,
  deleteExercise,
  fetchExercises,
  updateExercise,
} from '@/lib/exercisesApi'
import { ApiError } from '@/lib/api'

vi.mock('@/lib/exercisesApi', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/exercisesApi')>(
      '@/lib/exercisesApi',
    )
  return {
    ...actual,
    fetchExercises: vi.fn(),
    createExercise: vi.fn(),
    updateExercise: vi.fn(),
    deleteExercise: vi.fn(),
  }
})

vi.mock('@/contexts/useTrainerDashboard', () => ({
  useTrainerDashboard: vi.fn(() => ({
    data: { trainer: { profileId: 'tr-1' } },
    isSuccess: true,
    isPending: false,
    isError: false,
  })),
}))

function renderPage(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const globalExercise = {
  id: 'ex-global',
  name: 'Sentadilla',
  description: null,
  muscleGroup: 'Piernas',
  isGlobal: true,
  trainerId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const customExercise = {
  id: 'ex-custom',
  name: 'Mi press',
  description: 'Variante',
  muscleGroup: 'Pecho',
  isGlobal: false,
  trainerId: 'tr-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
}

describe('ExercisesPage', () => {
  beforeEach(() => {
    vi.mocked(fetchExercises).mockReset()
    vi.mocked(createExercise).mockReset()
    vi.mocked(updateExercise).mockReset()
    vi.mocked(deleteExercise).mockReset()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('lists exercises', async () => {
    vi.mocked(fetchExercises).mockResolvedValue([
      globalExercise,
      customExercise,
    ])
    renderPage(<ExercisesPage />)

    expect(await screen.findByText('Sentadilla')).toBeInTheDocument()
    expect(screen.getByText('Mi press')).toBeInTheDocument()
  })

  it('shows error and retries', async () => {
    vi.mocked(fetchExercises).mockRejectedValue(
      new ApiError(500, { message: 'fail' }),
    )
    renderPage(<ExercisesPage />)

    expect(
      await screen.findByText(/No pudimos cargar los ejercicios/i),
    ).toBeInTheDocument()
    vi.mocked(fetchExercises).mockResolvedValue([customExercise])
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Mi press')).toBeInTheDocument()
  })

  it('creates a custom exercise', async () => {
    vi.mocked(fetchExercises)
      .mockResolvedValueOnce([])
      .mockResolvedValue([customExercise])
    vi.mocked(createExercise).mockResolvedValue(customExercise)
    renderPage(<ExercisesPage />)

    await screen.findByText(/No hay ejercicios cargados/i)
    await userEvent.type(screen.getByLabelText('Nombre'), 'Mi press')
    await userEvent.type(screen.getByLabelText(/Descripción/i), 'Variante')
    await userEvent.type(screen.getByLabelText(/Grupo muscular/i), 'Pecho')
    await userEvent.click(
      screen.getByRole('button', { name: 'Agregar ejercicio' }),
    )

    expect(createExercise).toHaveBeenCalledWith({
      name: 'Mi press',
      description: 'Variante',
      muscleGroup: 'Pecho',
      isGlobal: false,
      trainerId: 'tr-1',
    })
    expect(await screen.findByText('Mi press')).toBeInTheDocument()
  })

  it('shows edit/delete only for custom exercises', async () => {
    vi.mocked(fetchExercises).mockResolvedValue([
      globalExercise,
      customExercise,
    ])
    renderPage(<ExercisesPage />)

    await screen.findByText('Mi press')
    const globalRow = screen.getByText('Sentadilla').closest('li')!
    const customRow = screen.getByText('Mi press').closest('li')!

    expect(
      within(globalRow).queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
    expect(
      within(customRow).getByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument()
    expect(
      within(customRow).getByRole('button', { name: 'Eliminar' }),
    ).toBeInTheDocument()
  })

  it('edits a custom exercise via modal', async () => {
    vi.mocked(fetchExercises).mockResolvedValue([customExercise])
    vi.mocked(updateExercise).mockResolvedValue({
      ...customExercise,
      name: 'Press actualizado',
    })
    renderPage(<ExercisesPage />)

    await userEvent.click(await screen.findByRole('button', { name: 'Editar' }))
    const dialog = screen.getByRole('dialog')
    const nameInput = within(dialog).getByDisplayValue('Mi press')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Press actualizado')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Guardar' }),
    )

    expect(updateExercise).toHaveBeenCalledWith('ex-custom', {
      name: 'Press actualizado',
      description: 'Variante',
      muscleGroup: 'Pecho',
    })
  })

  it('deletes a custom exercise after confirm', async () => {
    vi.mocked(fetchExercises).mockResolvedValue([customExercise])
    vi.mocked(deleteExercise).mockResolvedValue()
    renderPage(<ExercisesPage />)

    await userEvent.click(
      await screen.findByRole('button', { name: 'Eliminar' }),
    )

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteExercise).toHaveBeenCalledWith('ex-custom')
  })
})
