import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import { fetchClientIntakeResponse } from '@/lib/questionnaires'

interface ClientIntakePanelProps {
  clientId: string
}

export function ClientIntakePanel({ clientId }: ClientIntakePanelProps) {
  const query = useQuery({
    queryKey: ['client-intake', clientId],
    queryFn: () => fetchClientIntakeResponse(clientId),
    retry: false,
  })

  if (query.isPending) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">
        Cargando cuestionario…
      </p>
    )
  }

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <p className="text-[13px] text-[var(--text-secondary)]">
          El alumno aún no completó el cuestionario.
        </p>
      )
    }
    return (
      <p className="text-[13px] text-[var(--status-expired)]">
        No pudimos cargar las respuestas.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] text-[var(--text-secondary)]">
        Enviado el{' '}
        {new Date(query.data.submittedAt).toLocaleDateString('es-AR')}
      </p>
      {query.data.answers.map((answer) => (
        <div
          key={answer.questionId}
          className="rounded-lg border border-[var(--border-standard)] px-3 py-2"
        >
          <p className="text-[13px] font-medium text-[var(--text-primary)]">
            {answer.label}
          </p>
          <p className="text-[14px] text-[var(--text-secondary)]">
            {answer.value ?? '—'}
          </p>
        </div>
      ))}
    </div>
  )
}
