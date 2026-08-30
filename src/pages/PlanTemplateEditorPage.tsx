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
  updateBlockTemplate,
} from '@/lib/planTemplates'
import { createPlanFromTemplate, publishPlan } from '@/lib/plans'
import { WEEKDAY_LABELS } from '@/lib/routineWeekday'
import { fetchTrainerClientsWithUsers } from '@/lib/trainerClients'

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const num = Number(trimmed)
  return Number.isFinite(num) && num >= 0 ? num : undefined
}

/** HTML date input (YYYY-MM-DD) → ISO midnight UTC for API. */
function dateInputToIso(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return `${trimmed}T00:00:00.000Z`
}

function formatExerciseDetails(ex: {
  reps: number
  weight: number | null
  restAfterSec: number | null
  notes: string | null
}): string {
  const parts = [`${ex.reps} reps`]
  if (ex.weight != null) parts.push(`${ex.weight} kg`)
  if (ex.restAfterSec != null) parts.push(`descanso ${ex.restAfterSec}s`)
  if (ex.notes === 'por lado') parts.push('por lado')
  return parts.join(' · ')
}

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

  const nextRoutineOrder = nextOrder(treeQuery.data?.routines ?? [])
  const defaultWeekday = ((nextRoutineOrder % 7) + 7) % 7

  const [routineWeekday, setRoutineWeekday] = useState(defaultWeekday)
  const [routineName, setRoutineName] = useState('')
  const [exerciseId, setExerciseId] = useState('')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')
  const [restAfterSec, setRestAfterSec] = useState('')
  const [repsPerSide, setRepsPerSide] = useState(false)
  const [clientUserId, setClientUserId] = useState('')
  const [planStartDate, setPlanStartDate] = useState('')
  const [planEndDate, setPlanEndDate] = useState('')
  const [assignMessage, setAssignMessage] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)

  const [blockFormRoutineId, setBlockFormRoutineId] = useState<string | null>(
    null,
  )
  const [blockName, setBlockName] = useState('')
  const [blockRounds, setBlockRounds] = useState('1')
  const [blockRestSec, setBlockRestSec] = useState('')

  const [editingBlockKey, setEditingBlockKey] = useState<string | null>(null)
  const [editBlockName, setEditBlockName] = useState('')
  const [editBlockRounds, setEditBlockRounds] = useState('1')
  const [editBlockRestSec, setEditBlockRestSec] = useState('')

  const invalidateTree = () =>
    queryClient.invalidateQueries({
      queryKey: ['plan-template-tree', templateId],
    })

  const addRoutine = useMutation({
    mutationFn: () => {
      const order = nextOrder(treeQuery.data?.routines ?? [])
      const name =
        routineName.trim() ||
        WEEKDAY_LABELS[routineWeekday] ||
        suggestedRoutineName(order)
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
      const roundsNum = Number(blockRounds)
      const restBetweenRoundsSec = parseOptionalNumber(blockRestSec)
      return addBlockToRoutine(templateId, routineId, {
        name: blockName.trim() || `Bloque ${order + 1}`,
        order,
        rounds: Number.isFinite(roundsNum) && roundsNum >= 1 ? roundsNum : 1,
        ...(restBetweenRoundsSec !== undefined ? { restBetweenRoundsSec } : {}),
      })
    },
    onSuccess: () => {
      setBlockFormRoutineId(null)
      setBlockName('')
      setBlockRounds('1')
      setBlockRestSec('')
      void invalidateTree()
    },
  })

  const updateBlock = useMutation({
    mutationFn: (input: { routineId: string; blockId: string }) => {
      const roundsNum = Number(editBlockRounds)
      const restBetweenRoundsSec = parseOptionalNumber(editBlockRestSec)
      return updateBlockTemplate(templateId, input.routineId, input.blockId, {
        name: editBlockName.trim() || undefined,
        rounds:
          Number.isFinite(roundsNum) && roundsNum >= 1 ? roundsNum : undefined,
        restBetweenRoundsSec:
          editBlockRestSec.trim() === ''
            ? null
            : (restBetweenRoundsSec ?? null),
      })
    },
    onSuccess: () => {
      setEditingBlockKey(null)
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
      const weightNum = parseOptionalNumber(weight)
      const restNum = parseOptionalNumber(restAfterSec)
      return addExerciseToBlock(templateId, input.routineId, input.blockId, {
        exerciseId,
        order,
        reps: Number.isFinite(repsNum) && repsNum > 0 ? repsNum : 10,
        ...(weightNum !== undefined ? { weight: weightNum } : {}),
        ...(restNum !== undefined ? { restAfterSec: restNum } : {}),
        ...(repsPerSide ? { notes: 'por lado' } : {}),
      })
    },
    onSuccess: () => {
      void invalidateTree()
    },
  })

  const assign = useMutation({
    mutationFn: async () => {
      if (!trainerProfileId) throw new Error('missing trainer')
      const startDate = dateInputToIso(planStartDate)
      const endDate = dateInputToIso(planEndDate)
      const plan = await createPlanFromTemplate({
        trainerId: trainerProfileId,
        userId: clientUserId,
        templateId,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
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

  function startEditingBlock(
    routineId: string,
    block: {
      id: string
      name: string
      rounds: number
      restBetweenRoundsSec: number | null
    },
  ) {
    setEditingBlockKey(`${routineId}:${block.id}`)
    setEditBlockName(block.name)
    setEditBlockRounds(String(block.rounds))
    setEditBlockRestSec(
      block.restBetweenRoundsSec != null
        ? String(block.restBetweenRoundsSec)
        : '',
    )
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
              <label className="flex w-40 flex-col gap-1.5">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  Día
                </span>
                <select
                  aria-label="Día de la rutina"
                  value={routineWeekday}
                  onChange={(e) => {
                    const index = Number(e.target.value)
                    setRoutineWeekday(index)
                    setRoutineName(WEEKDAY_LABELS[index])
                  }}
                  className="h-11 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
                >
                  {WEEKDAY_LABELS.map((label, index) => (
                    <option key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-[180px] flex-1 flex-col gap-1.5">
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  Nueva rutina
                </span>
                <input
                  name="routineName"
                  placeholder={WEEKDAY_LABELS[routineWeekday]}
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
                    {blockFormRoutineId === routine.id ? (
                      <form
                        className="mb-3 flex flex-wrap items-end gap-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          addBlock.mutate(routine.id)
                        }}
                      >
                        <label className="flex min-w-[140px] flex-1 flex-col gap-1">
                          <span className="text-[12px] text-[var(--text-secondary)]">
                            Nombre
                          </span>
                          <input
                            aria-label={`Nombre del bloque en ${routine.name}`}
                            value={blockName}
                            onChange={(e) => setBlockName(e.target.value)}
                            placeholder="Pecho"
                            className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                          />
                        </label>
                        <label className="flex w-20 flex-col gap-1">
                          <span className="text-[12px] text-[var(--text-secondary)]">
                            Rounds
                          </span>
                          <input
                            aria-label={`Rounds del bloque en ${routine.name}`}
                            type="number"
                            min={1}
                            value={blockRounds}
                            onChange={(e) => setBlockRounds(e.target.value)}
                            className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                          />
                        </label>
                        <label className="flex w-28 flex-col gap-1">
                          <span className="text-[12px] text-[var(--text-secondary)]">
                            Descanso (s)
                          </span>
                          <input
                            aria-label={`Descanso entre rounds en ${routine.name}`}
                            type="number"
                            min={0}
                            value={blockRestSec}
                            onChange={(e) => setBlockRestSec(e.target.value)}
                            placeholder="60"
                            className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                          />
                        </label>
                        <button
                          type="submit"
                          disabled={addBlock.isPending}
                          className="h-10 rounded-xl bg-[var(--accent-purple)] px-4 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                          Crear bloque
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlockFormRoutineId(null)}
                          className="h-10 rounded-lg border border-[var(--border-standard)] px-3 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[#E4E4E712]"
                        >
                          Cancelar
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setBlockFormRoutineId(routine.id)
                          setBlockName('')
                          setBlockRounds('1')
                          setBlockRestSec('')
                        }}
                        disabled={addBlock.isPending}
                        className="mb-3 rounded-lg border border-[var(--border-standard)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[#E4E4E712] disabled:opacity-50"
                      >
                        Agregar bloque
                      </button>
                    )}
                    {routine.blocks.length === 0 ? (
                      <p className="text-[13px] text-[var(--text-secondary)]">
                        Sin bloques.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {routine.blocks.map((block) => {
                          const blockKey = `${routine.id}:${block.id}`
                          const isEditing = editingBlockKey === blockKey
                          return (
                            <li
                              key={block.id}
                              className="rounded-xl border border-[var(--border-standard)] p-3"
                            >
                              {isEditing ? (
                                <form
                                  className="mb-2 flex flex-wrap items-end gap-2"
                                  onSubmit={(e) => {
                                    e.preventDefault()
                                    updateBlock.mutate({
                                      routineId: routine.id,
                                      blockId: block.id,
                                    })
                                  }}
                                >
                                  <label className="flex min-w-[140px] flex-1 flex-col gap-1">
                                    <span className="text-[12px] text-[var(--text-secondary)]">
                                      Nombre
                                    </span>
                                    <input
                                      aria-label={`Editar nombre de ${block.name}`}
                                      value={editBlockName}
                                      onChange={(e) =>
                                        setEditBlockName(e.target.value)
                                      }
                                      className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                                    />
                                  </label>
                                  <label className="flex w-20 flex-col gap-1">
                                    <span className="text-[12px] text-[var(--text-secondary)]">
                                      Rounds
                                    </span>
                                    <input
                                      aria-label={`Editar rounds de ${block.name}`}
                                      type="number"
                                      min={1}
                                      value={editBlockRounds}
                                      onChange={(e) =>
                                        setEditBlockRounds(e.target.value)
                                      }
                                      className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                                    />
                                  </label>
                                  <label className="flex w-28 flex-col gap-1">
                                    <span className="text-[12px] text-[var(--text-secondary)]">
                                      Descanso (s)
                                    </span>
                                    <input
                                      aria-label={`Editar descanso de ${block.name}`}
                                      type="number"
                                      min={0}
                                      value={editBlockRestSec}
                                      onChange={(e) =>
                                        setEditBlockRestSec(e.target.value)
                                      }
                                      className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                                    />
                                  </label>
                                  <button
                                    type="submit"
                                    disabled={updateBlock.isPending}
                                    className="h-10 rounded-xl bg-[var(--accent-purple)] px-4 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingBlockKey(null)}
                                    className="h-10 rounded-lg border border-[var(--border-standard)] px-3 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[#E4E4E712]"
                                  >
                                    Cancelar
                                  </button>
                                </form>
                              ) : (
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <p className="text-[14px] font-medium text-[var(--text-primary)]">
                                    {block.name} · {block.rounds} round
                                    {block.rounds === 1 ? '' : 's'}
                                    {block.restBetweenRoundsSec != null
                                      ? ` · descanso ${block.restBetweenRoundsSec}s`
                                      : ''}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditingBlock(routine.id, block)
                                    }
                                    className="rounded-lg border border-[var(--border-standard)] px-2 py-1 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[#E4E4E712]"
                                  >
                                    Editar
                                  </button>
                                </div>
                              )}
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
                                      {catalog?.name ?? ex.exerciseId} ·{' '}
                                      {formatExerciseDetails(ex)}
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
                                <label className="flex w-20 flex-col gap-1">
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
                                <label className="flex w-20 flex-col gap-1">
                                  <span className="text-[12px] text-[var(--text-secondary)]">
                                    Peso (kg)
                                  </span>
                                  <input
                                    aria-label={`Peso para ${block.name}`}
                                    type="number"
                                    min={0}
                                    step="0.5"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="40"
                                    className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                                  />
                                </label>
                                <label className="flex w-24 flex-col gap-1">
                                  <span className="text-[12px] text-[var(--text-secondary)]">
                                    Descanso (s)
                                  </span>
                                  <input
                                    aria-label={`Descanso después de ${block.name}`}
                                    type="number"
                                    min={0}
                                    value={restAfterSec}
                                    onChange={(e) =>
                                      setRestAfterSec(e.target.value)
                                    }
                                    placeholder="90"
                                    className="h-10 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3 text-[13px] text-[var(--text-primary)]"
                                  />
                                </label>
                                <label className="flex h-10 items-center gap-2 self-end text-[12px] text-[var(--text-secondary)]">
                                  <input
                                    type="checkbox"
                                    aria-label={`Reps por lado para ${block.name}`}
                                    checked={repsPerSide}
                                    onChange={(e) =>
                                      setRepsPerSide(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-[var(--border-standard)]"
                                  />
                                  Por lado
                                </label>
                                <button
                                  type="submit"
                                  disabled={
                                    addExercise.isPending || !exerciseId
                                  }
                                  className="h-10 rounded-xl bg-[var(--accent-purple)] px-4 text-[13px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                  Agregar ejercicio
                                </button>
                              </form>
                            </li>
                          )
                        })}
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
                <label className="flex w-40 flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">
                    Inicio (opcional)
                  </span>
                  <input
                    aria-label="Fecha de inicio del plan"
                    type="date"
                    value={planStartDate}
                    onChange={(e) => setPlanStartDate(e.target.value)}
                    className="h-11 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
                  />
                </label>
                <label className="flex w-40 flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">
                    Fin (opcional)
                  </span>
                  <input
                    aria-label="Fecha de fin del plan"
                    type="date"
                    value={planEndDate}
                    onChange={(e) => setPlanEndDate(e.target.value)}
                    className="h-11 rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
                  />
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
