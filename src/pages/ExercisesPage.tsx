import { type FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import { ApiError } from '@/lib/api'
import {
  createExercise,
  deleteExercise,
  fetchExercises,
  updateExercise,
  type ExerciseDto,
} from '@/lib/exercisesApi'
import { formatShortDate } from '@/lib/format'

const GRID_COLS =
  'grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_120px_100px_100px_120px]'

const EXERCISES_QUERY_KEY = ['exercises', 'all'] as const

function emptyForm() {
  return { name: '', description: '', muscleGroup: '' }
}

export default function ExercisesPage() {
  const dashboard = useTrainerDashboard()
  const trainerProfileId = dashboard.data?.trainer.profileId
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: EXERCISES_QUERY_KEY,
    queryFn: () => fetchExercises(),
    enabled: dashboard.isSuccess,
  })

  const [createForm, setCreateForm] = useState(emptyForm)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ExerciseDto | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editError, setEditError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () =>
      createExercise({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        muscleGroup: createForm.muscleGroup.trim() || undefined,
        isGlobal: false,
        trainerId: trainerProfileId,
      }),
    onSuccess: async () => {
      setCreateForm(emptyForm())
      setCreateError(null)
      await queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY })
    },
    onError: (err) => {
      setCreateError(
        err instanceof ApiError
          ? `No se pudo crear el ejercicio (${err.status}).`
          : 'No se pudo crear el ejercicio.',
      )
    },
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      updateExercise(editing!.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        muscleGroup: editForm.muscleGroup.trim() || null,
      }),
    onSuccess: async () => {
      setEditing(null)
      setEditError(null)
      await queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY })
    },
    onError: (err) => {
      setEditError(
        err instanceof ApiError
          ? `No se pudo guardar (${err.status}).`
          : 'No se pudo guardar el ejercicio.',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EXERCISES_QUERY_KEY })
    },
  })

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!trainerProfileId || !createForm.name.trim()) return
    setCreateError(null)
    createMutation.mutate()
  }

  function openEdit(exercise: ExerciseDto) {
    setEditing(exercise)
    setEditForm({
      name: exercise.name,
      description: exercise.description ?? '',
      muscleGroup: exercise.muscleGroup ?? '',
    })
    setEditError(null)
  }

  function handleEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing || !editForm.name.trim()) return
    setEditError(null)
    updateMutation.mutate()
  }

  function handleDelete(exercise: ExerciseDto) {
    const ok = window.confirm(
      `¿Eliminar "${exercise.name}"? Esta acción no se puede deshacer.`,
    )
    if (!ok) return
    deleteMutation.mutate(exercise.id)
  }

  if (dashboard.isPending) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Ejercicios" />
        <p className="p-8 text-[14px] text-[var(--text-secondary)]">
          Cargando…
        </p>
      </div>
    )
  }

  if (dashboard.isError || !trainerProfileId) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Ejercicios" />
        <p className="p-8 text-[14px] text-[var(--text-secondary)]">
          Necesitamos tu perfil de entrenador para gestionar ejercicios.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Ejercicios"
        description="Biblioteca de ejercicios disponibles para tus planes"
      />

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-8">
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex flex-col gap-3 rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-4"
        >
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">
            Nuevo ejercicio personalizado
          </p>
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-[var(--text-primary)]">
              Nombre
            </span>
            <input
              id="exercise-name"
              name="name"
              required
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, name: e.target.value }))
              }
              className="h-11 w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-[var(--text-primary)]">
              Descripción (opcional)
            </span>
            <textarea
              id="exercise-description"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className="w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-[var(--text-primary)]">
              Grupo muscular (opcional)
            </span>
            <input
              id="exercise-muscle-group"
              value={createForm.muscleGroup}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, muscleGroup: e.target.value }))
              }
              className="h-11 w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
            />
          </label>
          {createError ? (
            <p
              role="alert"
              className="text-[13px] text-[var(--status-expired)]"
            >
              {createError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={createMutation.isPending || !createForm.name.trim()}
            className="w-fit rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creando…' : 'Agregar ejercicio'}
          </button>
        </form>

        {query.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Cargando ejercicios…
          </p>
        ) : query.isError ? (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              No pudimos cargar los ejercicios
              {query.error?.message ? ` (${query.error.message})` : ''}.
            </p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
              className="w-fit rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              Reintentar
            </button>
          </div>
        ) : query.data ? (
          query.data.length === 0 ? (
            <p className="text-[14px] text-[var(--text-secondary)]">
              No hay ejercicios cargados en el sistema.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)]">
              <div
                className={`grid ${GRID_COLS} gap-2 border-b border-[var(--border-standard)] px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)]`}
              >
                <span>Nombre</span>
                <span>Descripción</span>
                <span>Grupo</span>
                <span>Origen</span>
                <span>Actualizado</span>
                <span />
              </div>
              <ul className="divide-y divide-[#E4E4E720]">
                {query.data.map((ex) => (
                  <li
                    key={ex.id}
                    className={`grid ${GRID_COLS} gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]`}
                  >
                    <span className="font-semibold">{ex.name}</span>
                    <span className="line-clamp-2 text-[var(--text-secondary)]">
                      {ex.description ?? '—'}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {ex.muscleGroup ?? '—'}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {ex.isGlobal ? 'Global' : 'Personalizado'}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {formatShortDate(ex.updatedAt)}
                    </span>
                    <span className="flex flex-wrap gap-2">
                      {!ex.isGlobal ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(ex)}
                            className="text-[13px] font-semibold text-[var(--accent-purple)] hover:opacity-80"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ex)}
                            disabled={deleteMutation.isPending}
                            className="text-[13px] text-[var(--status-expired)] hover:opacity-80 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setEditing(null)}
        >
          <form
            role="dialog"
            aria-labelledby="edit-exercise-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => void handleEdit(e)}
            className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-5 shadow-lg"
          >
            <p
              id="edit-exercise-title"
              className="text-[15px] font-semibold text-[var(--text-primary)]"
            >
              Editar ejercicio
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-medium text-[var(--text-primary)]">
                Nombre
              </span>
              <input
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="h-11 w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-medium text-[var(--text-primary)]">
                Descripción
              </span>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className="w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[14px] font-medium text-[var(--text-primary)]">
                Grupo muscular
              </span>
              <input
                value={editForm.muscleGroup}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, muscleGroup: e.target.value }))
                }
                className="h-11 w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
              />
            </label>
            {editError ? (
              <p
                role="alert"
                className="text-[13px] text-[var(--status-expired)]"
              >
                {editError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updateMutation.isPending || !editForm.name.trim()}
                className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-[var(--border-standard)] px-5 py-2.5 text-[14px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
