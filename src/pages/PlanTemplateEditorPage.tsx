import { type FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import { fetchExercises } from '@/lib/exercisesApi'
import { formatMacroLine } from '@/lib/nutritionCatalog'
import {
  addBlockToRoutine,
  addExerciseToBlock,
  addRoutineToTemplate,
  fetchPlanTemplateTree,
  nextOrder,
  suggestedRoutineName,
} from '@/lib/planTemplates'
import { createPlanFromTemplate, publishPlan } from '@/lib/plans'
import { fetchTrainerClientsWithUsers } from '@/lib/trainerClients'

export default function PlanTemplateEditorPage() {
  const { templateId = '' } = useParams()
  const dashboard = useTrainerDashboard()
  const trainerProfileId = dashboard.data?.trainer.profileId
  const queryClient = useQueryClient()

  const treeQuery = useQuery({
    queryKey: ['plan-template-tree', templateId],
    queryFn: () => fetchPlanTemplateTree(templateId),
    enabled: Boolean(templateId),
  })

  const exercisesQuery = useQuery({
    queryKey: ['exercises', 'all'],
    queryFn: () => fetchExercises(),
    enabled: Boolean(templateId),
  })

  const clientsQuery = useQuery({
    queryKey: ['trainerClients', trainerProfileId, 1, 50],
    queryFn: () => fetchTrainerClientsWithUsers(1, 50),
    enabled: Boolean(trainerProfileId) && dashboard.isSuccess,
  })

  const [routineName, setRoutineName] = useState('')
  const [exerciseId, setExerciseId] = useState('')
  const [reps, setReps] = useState('10')
  const [clientUserId, setClientUserId] = useState('')
  const [assignMessage, setAssignMessage] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)

  const invalidateTree = () =>
    queryClient.invalidateQueries({
      queryKey: ['plan-template-tree', templateId],
    })

  const addRoutine = useMutation({
    mutationFn: () => {
      const order = nextOrder(treeQuery.data?.routines ?? [])
      const name = routineName.trim() || suggestedRoutineName(order)
      return addRoutineToTemplate(templateId, { name, order })
    },
    onSuccess: () => {
      setRoutineName('')
      void invalidateTree()
    },
  })

  const addBlock = useMutation({
    mutationFn: (routineId: string) => {
      const routine = treeQuery.data?.routines.find((r) => r.id === routineId)
      const order = nextOrder(routine?.blocks ?? [])
      return addBlockToRoutine(templateId, routineId, {
        name: 'Bloque 1',
        order,
        rounds: 1,
      })
    },
    onSuccess: () => {
      void invalidateTree()
    },
  })

  const addExercise = useMutation({
    mutationFn: (input: { routineId: string; blockId: string }) => {
      const routine = treeQuery.data?.routines.find(
        (r) => r.id === input.routineId,
      )
      const block = routine?.blocks.find((b) => b.id === input.blockId)
      const order = nextOrder(block?.exercises ?? [])
      const repsNum = Number(reps)
      return addExerciseToBlock(templateId, input.routineId, input.blockId, {
        exerciseId,
        order,
        reps: Number.isFinite(repsNum) && repsNum > 0 ? repsNum : 10,
      })
    },
    onSuccess: () => {
      void invalidateTree()
    },
  })

  const assign = useMutation({
    mutationFn: async () => {
      if (!trainerProfileId) throw new Error('missing trainer')
      const plan = await createPlanFromTemplate({
        trainerId: trainerProfileId,
        userId: clientUserId,
        templateId,
      })
      try {
        await publishPlan(plan.id)
        return { planId: plan.id, published: true }
      } catch (err) {
        return { planId: plan.id, published: false, err }
      }
    },
    onSuccess: (result) => {
      if (result.published) {
        setAssignError(null)
        setAssignMessage('Plan asignado y publicado.')
      } else {
        setAssignMessage(null)
        setAssignError(
          'Plan creado como borrador; no se pudo publicar. Revisá /app/planes.',
        )
      }
    },
    onError: () => {
      setAssignMessage(null)
      setAssignError('No se pudo asignar el plan. Intentá de nuevo.')
    },
  })

  function handleAddRoutine(e: FormEvent) {
    e.preventDefault()
    addRoutine.mutate()
  }

  if (!templateId) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Plantilla" />
        <p className="p-8 text-[14px] text-[var(--text-secondary)]">
          Falta el id de la plantilla.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title={treeQuery.data?.template.name ?? 'Plantilla'}
        description="Rutinas → bloques → ejercicios. Después asigná a un cliente y publicá."
      />

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-8">
        <Link
          to="/app/plantillas"
          className="w-fit text-[13px] font-semibold text-[var(--accent-purple)]"
        >
          ← Plantillas
        </Link>

        {treeQuery.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Cargando plantilla…
          </p>
        ) : treeQuery.isError ? (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              No pudimos cargar la plantilla
              {treeQuery.error?.message ? ` (${treeQuery.error.message})` : ''}.
            </p>
            <button
              type="button"
              onClick={() => void treeQuery.refetch()}
              className="w-fit rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        ) : treeQuery.data ? (
          <>
            {treeQuery.data.template.nutritionTemplate ? (
              <p className="text-[13px] text-[var(--text-secondary)]">
                Nutrición:{' '}
                {formatMacroLine(treeQuery.data.template.nutritionTemplate) ||
                  'preset cargado'}
              </p>
            ) : (
              <p className="text-[13px] text-[var(--text-secondary)]">
                Sin nutrición (se elige solo al crear).
              </p>
            )}

            <form
              onSubmit={handleAddRoutine}
              className="flex flex-wrap items-end gap-3"
            >
              <label className="flex min-w-[180px] flex-1 flex-col gap-1.5">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  Nueva rutina
                </span>
                <input
                  name="routineName"
                  placeholder={suggestedRoutineName(
                    nextOrder(treeQuery.data.routines),
                  )}
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  className="h-11 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={addRoutine.isPending}
                className="h-11 rounded-xl bg-[var(--accent-purple)] px-5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Agregar rutina
              </button>
            </form>

            {treeQuery.data.routines.length === 0 ? (
              <p className="text-[14px] text-[var(--text-secondary)]">
                Agregá una rutina para empezar (ej. Lunes).
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {treeQuery.data.routines.map((routine) => (
                  <li
                    key={routine.id}
                    className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-4"
                  >
                    <p className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">
                      {routine.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => addBlock.mutate(routine.id)}
                      disabled={addBlock.isPending}
                      className="mb-3 rounded-lg border border-[var(--border-standard)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[#E4E4E712] disabled:opacity-50"
                    >
                      Agregar bloque
                    </button>
                    {routine.blocks.length === 0 ? (
                      <p className="text-[13px] text-[var(--text-secondary)]">
                        Sin bloques.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {routine.blocks.map((block) => (
                          <li
                            key={block.id}
                            className="rounded-xl border border-[var(--border-standard)] p-3"
                          >
                            <p className="mb-2 text-[14px] font-medium text-[var(--text-primary)]">
                              {block.name} · {block.rounds} round
                              {block.rounds === 1 ? '' : 's'}
                            </p>
                            <ul className="mb-3 flex flex-col gap-1">
                              {block.exercises.map((ex) => {
                                const catalog = exercisesQuery.data?.find(
                                  (item) => item.id === ex.exerciseId,
                                )
                                return (
                                  <li
                                    key={ex.id}
                                    className="text-[13px] text-[var(--text-secondary)]"
                                  >
                                    {catalog?.name ?? ex.exerciseId} · {ex.reps}{' '}
                                    reps
                                  </li>
                                )
                              })}
                            </ul>
                            <form
                              className="flex flex-wrap items-end gap-2"
                              onSubmit={(e) => {
                                e.preventDefault()
                                if (!exerciseId) return
                                addExercise.mutate({
                                  routineId: routine.id,
                                  blockId: block.id,
                                })
                              }}
                            >
                              <label className="flex min-w-[160px] flex-1 flex-col gap-1">
                                <span className="text-[12px] text-[var(--text-secondary)]">
                                  Ejercicio
                                </span>
                                <select
                                  aria-label={`Ejercicio para ${block.name}`}
                                  value={exerciseId}
                                  onChange={(e) =>
                                    setExerciseId(e.target.value)
                                  }
                                  className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                                >
                                  <option value="">Elegí un ejercicio</option>
                                  {(exercisesQuery.data ?? []).map((ex) => (
                                    <option key={ex.id} value={ex.id}>
                                      {ex.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="flex w-24 flex-col gap-1">
                                <span className="text-[12px] text-[var(--text-secondary)]">
                                  Reps
                                </span>
                                <input
                                  aria-label={`Reps para ${block.name}`}
                                  type="number"
                                  min={1}
                                  value={reps}
                                  onChange={(e) => setReps(e.target.value)}
                                  className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                                />
                              </label>
                              <button
                                type="submit"
                                disabled={addExercise.isPending || !exerciseId}
                                className="h-10 rounded-xl bg-[var(--accent-purple)] px-4 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                              >
                                Agregar ejercicio
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-4">
              <h2 className="mb-3 text-[15px] font-semibold text-[var(--text-primary)]">
                Asignar a un cliente
              </h2>
              <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!clientUserId) return
                  setAssignError(null)
                  setAssignMessage(null)
                  assign.mutate()
                }}
              >
                <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">
                    Cliente
                  </span>
                  <select
                    aria-label="Cliente"
                    value={clientUserId}
                    onChange={(e) => setClientUserId(e.target.value)}
                    className="h-11 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)]"
                  >
                    <option value="">Elegí un cliente</option>
                    {(clientsQuery.data?.list.data ?? []).map((row) => {
                      const user = clientsQuery.data?.usersById[row.userId]
                      return (
                        <option key={row.id} value={row.userId}>
                          {user?.email ?? row.userId}
                        </option>
                      )
                    })}
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={assign.isPending || !clientUserId}
                  className="h-11 rounded-xl bg-[var(--accent-purple)] px-5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  Asignar y publicar
                </button>
              </form>
              {assignMessage ? (
                <p className="mt-3 text-[13px] text-[var(--text-primary)]">
                  {assignMessage}
                </p>
              ) : null}
              {assignError ? (
                <p
                  role="alert"
                  className="mt-3 text-[13px] text-[var(--status-expired)]"
                >
                  {assignError}
                </p>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
