import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchTrainerQuestionnaire,
  upsertTrainerQuestionnaire,
  type QuestionnaireQuestionInput,
  type QuestionnaireQuestionType,
} from '@/lib/questionnaires'

const DEFAULT_QUESTIONS: QuestionnaireQuestionInput[] = [
  { label: 'Edad', type: 'number', isRequired: true },
  { label: 'Altura (cm)', type: 'number', isRequired: false },
  { label: 'Peso (kg)', type: 'number', isRequired: false },
  { label: 'Objetivo', type: 'textarea', isRequired: true },
]

export function QuestionnaireSettingsSection() {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<string | null>(null)
  const [draftEnabled, setDraftEnabled] = useState<boolean | null>(null)
  const [draftQuestions, setDraftQuestions] = useState<
    QuestionnaireQuestionInput[] | null
  >(null)

  const query = useQuery({
    queryKey: ['trainer-questionnaire'],
    queryFn: fetchTrainerQuestionnaire,
  })

  const isEnabled = draftEnabled ?? query.data?.isEnabled ?? false
  const questions =
    draftQuestions ??
    query.data?.questions.map((q) => ({
      label: q.label,
      type: q.type,
      isRequired: q.required,
    })) ??
    []

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertTrainerQuestionnaire({
        isEnabled,
        questions,
      }),
    onSuccess: async () => {
      setMessage('Cuestionario guardado.')
      setDraftEnabled(null)
      setDraftQuestions(null)
      await queryClient.invalidateQueries({
        queryKey: ['trainer-questionnaire'],
      })
    },
    onError: () => setMessage('No pudimos guardar el cuestionario.'),
  })

  function updateQuestion(
    index: number,
    patch: Partial<QuestionnaireQuestionInput>,
  ) {
    const next = [...questions]
    next[index] = { ...next[index], ...patch }
    setDraftQuestions(next)
  }

  function addQuestion() {
    if (questions.length >= 20) return
    setDraftQuestions([
      ...questions,
      { label: '', type: 'text', isRequired: false },
    ])
  }

  function removeQuestion(index: number) {
    setDraftQuestions(questions.filter((_, i) => i !== index))
  }

  function loadDefaults() {
    setDraftQuestions(DEFAULT_QUESTIONS)
    setDraftEnabled(true)
  }

  return (
    <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
      <h2 className="font-display text-[20px] font-bold text-[var(--text-primary)]">
        Cuestionario post-suscripción
      </h2>
      <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
        Preguntas opcionales que el alumno completa cuando su suscripción queda
        activa.
      </p>

      {query.isPending ? (
        <p className="mt-4 text-[14px] text-[var(--text-secondary)]">
          Cargando…
        </p>
      ) : query.isError ? (
        <p className="mt-4 text-[14px] text-[var(--status-expired)]">
          No pudimos cargar el cuestionario.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-[14px] text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setDraftEnabled(e.target.checked)}
            />
            Habilitar cuestionario para nuevos alumnos
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadDefaults}
              className="rounded-lg border border-[var(--border-standard)] px-3 py-1.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Cargar plantilla sugerida
            </button>
            <button
              type="button"
              onClick={addQuestion}
              className="rounded-lg border border-[var(--border-standard)] px-3 py-1.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-page)]"
            >
              Agregar pregunta
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {questions.map((q, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-xl border border-[var(--border-standard)] p-3 md:grid-cols-[1fr_140px_auto_auto]"
              >
                <input
                  value={q.label}
                  onChange={(e) =>
                    updateQuestion(index, { label: e.target.value })
                  }
                  placeholder="Pregunta"
                  className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px]"
                />
                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQuestion(index, {
                      type: e.target.value as QuestionnaireQuestionType,
                    })
                  }
                  className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px]"
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="textarea">Párrafo</option>
                </select>
                <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={Boolean(q.isRequired)}
                    onChange={(e) =>
                      updateQuestion(index, { isRequired: e.target.checked })
                    }
                  />
                  Obligatoria
                </label>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-[13px] text-[var(--status-expired)]"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => {
              setMessage(null)
              saveMutation.mutate()
            }}
            className="self-start rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Guardando…' : 'Guardar cuestionario'}
          </button>
          {message ? (
            <p
              role="status"
              className="text-[13px] text-[var(--text-secondary)]"
            >
              {message}
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}
