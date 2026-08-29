import { apiFetch } from './api'
import type { SnapshotNutrition } from './plans'
import { WEEKDAY_LABELS } from './routineWeekday'

export interface PlanTemplateDto {
  id: string
  trainerId: string
  name: string
  notes: string | null
  nutritionTemplate: SnapshotNutrition | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface RoutineTemplateDto {
  id: string
  planTemplateId: string
  name: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface BlockTemplateDto {
  id: string
  routineTemplateId: string
  name: string
  order: number
  rounds: number
  restBetweenRoundsSec: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface BlockExerciseTemplateDto {
  id: string
  blockTemplateId: string
  exerciseId: string
  order: number
  reps: number
  weight: number | null
  restAfterSec: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface BlockWithExercises extends BlockTemplateDto {
  exercises: BlockExerciseTemplateDto[]
}

export interface RoutineWithBlocks extends RoutineTemplateDto {
  blocks: BlockWithExercises[]
}

export interface PlanTemplateTree {
  template: PlanTemplateDto
  routines: RoutineWithBlocks[]
}

export function nextOrder(items: { order: number }[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((item) => item.order)) + 1
}

export function suggestedRoutineName(order: number): string {
  return WEEKDAY_LABELS[((order % 7) + 7) % 7]
}

export async function fetchPlanTemplates(
  trainerId: string,
): Promise<PlanTemplateDto[]> {
  const params = new URLSearchParams({ trainerId })
  return apiFetch<PlanTemplateDto[]>(`/plans/templates?${params.toString()}`)
}

export async function fetchPlanTemplate(
  templateId: string,
): Promise<PlanTemplateDto> {
  return apiFetch<PlanTemplateDto>(
    `/plans/templates/${encodeURIComponent(templateId)}`,
  )
}

export async function createPlanTemplate(input: {
  trainerId: string
  name: string
  nutritionTemplate?: SnapshotNutrition | null
}): Promise<PlanTemplateDto> {
  return apiFetch<PlanTemplateDto>('/plans/templates', {
    method: 'POST',
    body: JSON.stringify({
      trainerId: input.trainerId,
      name: input.name,
      nutritionTemplate: input.nutritionTemplate ?? null,
    }),
  })
}

export async function fetchTemplateRoutines(
  templateId: string,
): Promise<RoutineTemplateDto[]> {
  return apiFetch<RoutineTemplateDto[]>(
    `/plans/templates/${encodeURIComponent(templateId)}/routines`,
  )
}

export async function addRoutineToTemplate(
  templateId: string,
  input: { name: string; order: number },
): Promise<RoutineTemplateDto> {
  return apiFetch<RoutineTemplateDto>(
    `/plans/templates/${encodeURIComponent(templateId)}/routines`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export async function fetchRoutineBlocks(
  templateId: string,
  routineId: string,
): Promise<BlockTemplateDto[]> {
  return apiFetch<BlockTemplateDto[]>(
    `/plans/templates/${encodeURIComponent(templateId)}/routines/${encodeURIComponent(routineId)}/blocks`,
  )
}

export async function addBlockToRoutine(
  templateId: string,
  routineId: string,
  input: { name: string; order: number; rounds: number },
): Promise<BlockTemplateDto> {
  return apiFetch<BlockTemplateDto>(
    `/plans/templates/${encodeURIComponent(templateId)}/routines/${encodeURIComponent(routineId)}/blocks`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export async function fetchBlockExercises(
  templateId: string,
  routineId: string,
  blockId: string,
): Promise<BlockExerciseTemplateDto[]> {
  return apiFetch<BlockExerciseTemplateDto[]>(
    `/plans/templates/${encodeURIComponent(templateId)}/routines/${encodeURIComponent(routineId)}/blocks/${encodeURIComponent(blockId)}/exercises`,
  )
}

export async function addExerciseToBlock(
  templateId: string,
  routineId: string,
  blockId: string,
  input: { exerciseId: string; order: number; reps: number },
): Promise<BlockExerciseTemplateDto> {
  return apiFetch<BlockExerciseTemplateDto>(
    `/plans/templates/${encodeURIComponent(templateId)}/routines/${encodeURIComponent(routineId)}/blocks/${encodeURIComponent(blockId)}/exercises`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export async function fetchPlanTemplateTree(
  templateId: string,
): Promise<PlanTemplateTree> {
  const template = await fetchPlanTemplate(templateId)
  const routines = await fetchTemplateRoutines(templateId)
  const routinesWithBlocks: RoutineWithBlocks[] = await Promise.all(
    routines.map(async (routine) => {
      const blocks = await fetchRoutineBlocks(templateId, routine.id)
      const blocksWithExercises: BlockWithExercises[] = await Promise.all(
        blocks.map(async (block) => {
          const exercises = await fetchBlockExercises(
            templateId,
            routine.id,
            block.id,
          )
          return { ...block, exercises }
        }),
      )
      return { ...routine, blocks: blocksWithExercises }
    }),
  )
  return { template, routines: routinesWithBlocks }
}
