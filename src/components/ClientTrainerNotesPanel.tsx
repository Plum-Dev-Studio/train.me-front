import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTrainerClientNotes } from '@/lib/trainerClients'

interface ClientTrainerNotesPanelProps {
  clientId: string
  initialNotes: string | null
  trainerProfileId: string | undefined
}

export function ClientTrainerNotesPanel({
  clientId,
  initialNotes,
  trainerProfileId,
}: ClientTrainerNotesPanelProps) {
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setNotes(initialNotes ?? '')
    setSaveMessage(null)
    setSaveError(null)
  }, [clientId, initialNotes])

  const save = useMutation({
    mutationFn: () =>
      updateTrainerClientNotes(clientId, notes.trim() === '' ? null : notes),
    onSuccess: () => {
      setSaveError(null)
      setSaveMessage('Notas guardadas.')
      void queryClient.invalidateQueries({
        queryKey: ['trainerClients', trainerProfileId],
      })
    },
    onError: () => {
      setSaveMessage(null)
      setSaveError('No pudimos guardar las notas. Intentá de nuevo.')
    },
  })

  const dirty = (initialNotes ?? '') !== notes

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-[var(--text-secondary)]">
        Solo vos podés ver estas notas; el alumno no las ve.
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">
          Notas privadas
        </span>
        <textarea
          aria-label="Notas privadas del entrenador"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setSaveMessage(null)
            setSaveError(null)
          }}
          rows={4}
          placeholder="Objetivos, lesiones, preferencias…"
          className="rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 py-2.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={save.isPending || !dirty}
          onClick={() => save.mutate()}
          className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {save.isPending ? 'Guardando…' : 'Guardar notas'}
        </button>
        {saveMessage ? (
          <p className="text-[13px] text-[var(--text-primary)]">
            {saveMessage}
          </p>
        ) : null}
        {saveError ? (
          <p role="alert" className="text-[13px] text-[var(--status-expired)]">
            {saveError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
