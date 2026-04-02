import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { fetchExercises } from '@/lib/exercisesApi'

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function ExercisesPage() {
  const query = useQuery({
    queryKey: ['exercises', 'all'],
    queryFn: () => fetchExercises(),
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Ejercicios"
        description="Biblioteca de ejercicios disponibles para tus planes"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-8">
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
              <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_120px_100px_100px] gap-2 border-b border-[var(--border-standard)] px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)]">
                <span>Nombre</span>
                <span>Descripción</span>
                <span>Grupo</span>
                <span>Origen</span>
                <span>Actualizado</span>
              </div>
              <ul className="divide-y divide-[#E4E4E720]">
                {query.data.map((ex) => (
                  <li
                    key={ex.id}
                    className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_120px_100px_100px] gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]"
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
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
