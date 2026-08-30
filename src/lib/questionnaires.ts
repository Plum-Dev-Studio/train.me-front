import { apiFetch } from './api'

export type QuestionnaireQuestionType = 'text' | 'number' | 'textarea'

export interface QuestionnaireQuestion {
  id: string | null
  sortOrder: number
  label: string
  type: QuestionnaireQuestionType
  required: boolean
}

export interface TrainerQuestionnaire {
  id: string | null
  trainerId: string
  isEnabled: boolean
  questions: QuestionnaireQuestion[]
  updatedAt: string | null
}

export interface MyIntakeQuestionnaireStatus {
  required: boolean
  completed: boolean
  questionnaire: TrainerQuestionnaire | null
}

export interface ClientIntakeAnswer {
  questionId: string
  label: string
  type: QuestionnaireQuestionType
  required: boolean
  value: string | null
}

export interface ClientIntakeResponse {
  clientUserId: string
  submittedAt: string
  answers: ClientIntakeAnswer[]
}

export interface QuestionnaireQuestionInput {
  label: string
  type: QuestionnaireQuestionType
  isRequired?: boolean
}

export interface UpsertTrainerQuestionnaireInput {
  isEnabled: boolean
  questions: QuestionnaireQuestionInput[]
}

export interface IntakeAnswerInput {
  questionId: string
  value?: string | null
}

export async function fetchTrainerQuestionnaire(): Promise<TrainerQuestionnaire> {
  return apiFetch<TrainerQuestionnaire>('/trainers/me/questionnaire')
}

export async function upsertTrainerQuestionnaire(
  input: UpsertTrainerQuestionnaireInput,
): Promise<TrainerQuestionnaire> {
  return apiFetch<TrainerQuestionnaire>('/trainers/me/questionnaire', {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function fetchMyIntakeQuestionnaire(): Promise<MyIntakeQuestionnaireStatus> {
  return apiFetch<MyIntakeQuestionnaireStatus>(
    '/subscriptions/me/intake-questionnaire',
  )
}

export async function submitMyIntakeQuestionnaire(
  answers: IntakeAnswerInput[],
): Promise<{ id: string; submittedAt: string }> {
  return apiFetch<{ id: string; submittedAt: string }>(
    '/subscriptions/me/intake-questionnaire',
    {
      method: 'PUT',
      body: JSON.stringify({ answers }),
    },
  )
}

export async function fetchClientIntakeResponse(
  clientId: string,
): Promise<ClientIntakeResponse> {
  return apiFetch<ClientIntakeResponse>(
    `/trainers/me/clients/${clientId}/intake-response`,
  )
}
