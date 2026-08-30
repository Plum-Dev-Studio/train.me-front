import { useState, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import {
  submitMyIntakeQuestionnaire,
  type TrainerQuestionnaire,
} from '@/lib/questionnaires'

interface IntakeQuestionnaireFormProps {
  questionnaire: TrainerQuestionnaire
  onSubmitted: () => void
}

export function IntakeQuestionnaireForm({
  questionnaire,
  onSubmitted,
}: IntakeQuestionnaireFormProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: () =>
      submitMyIntakeQuestionnaire(
        questionnaire.questions.map((q) => ({
          questionId: q.id ?? '',
          value: values[q.id ?? ''] ?? '',
        })),
      ),
    onSuccess: async () => {
      setMessage('¡Gracias! Tus respuestas fueron enviadas.')
      await queryClient.invalidateQueries({
        queryKey: ['intake-questionnaire', 'me'],
      })
      onSubmitted()
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setMessage('Ya completaste este cuestionario.')
        return
      }
      setMessage('No pudimos enviar tus respuestas.')
    },
  })

  return (
    <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
      <h2 className="font-display text-[22px] font-bold text-[var(--text-primary)]">
        Completá tu cuestionario
      </h2>
      <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
        Tu entrenador necesita esta info para personalizar tu plan.
      </p>

      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          setMessage(null)
          saveMutation.mutate()
        }}
      >
        {questionnaire.questions.map((question) => {
          const key = question.id ?? question.label
          const commonProps = {
            id: key,
            value: values[key] ?? '',
            onChange: (
              e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => setValues((prev) => ({ ...prev, [key]: e.target.value })),
            className:
              'rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]',
            required: question.required,
          }

          return (
            <label
              key={key}
              className="flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]"
            >
              {question.label}
              {question.required ? ' *' : ''}
              {question.type === 'textarea' ? (
                <textarea rows={3} {...commonProps} />
              ) : (
                <input
                  type={question.type === 'number' ? 'number' : 'text'}
                  {...commonProps}
                />
              )}
            </label>
          )
        })}

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="self-start rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Enviando…' : 'Enviar respuestas'}
        </button>
        {message ? (
          <p role="status" className="text-[13px] text-[var(--text-secondary)]">
            {message}
          </p>
        ) : null}
      </form>
    </section>
  )
}
