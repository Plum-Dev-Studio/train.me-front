import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { searchPublicTrainers } from '@/lib/publicTrainers'

function formatPrice(price: number | null): string {
  if (price === null) return 'Precio a coordinar'
  return `$${price.toLocaleString('es-AR')}/mes`
}

export default function TrainersSearchPage() {
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [minExperienceYears, setMinExperienceYears] = useState('')
  const [maxMonthlyPrice, setMaxMonthlyPrice] = useState('')

  const params = useMemo(
    () => ({
      q: q || undefined,
      specialty: specialty || undefined,
      minExperienceYears: minExperienceYears
        ? Number(minExperienceYears)
        : undefined,
      maxMonthlyPrice: maxMonthlyPrice ? Number(maxMonthlyPrice) : undefined,
      page: 1,
      limit: 30,
    }),
    [maxMonthlyPrice, minExperienceYears, q, specialty],
  )

  const query = useQuery({
    queryKey: ['public-trainers', params],
    queryFn: () => searchPublicTrainers(params),
  })

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[34px] font-bold text-[var(--text-primary)]">
          Encontrá tu entrenador ideal
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Compará perfiles, experiencia y precio mensual para elegir el plan que
          mejor se adapte a vos.
        </p>
      </header>

      <section className="grid gap-3 rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-4 md:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o bio"
          className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px]"
        />
        <input
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="Especialidad"
          className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px]"
        />
        <input
          value={minExperienceYears}
          onChange={(e) => setMinExperienceYears(e.target.value)}
          inputMode="numeric"
          placeholder="Experiencia mínima (años)"
          className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px]"
        />
        <input
          value={maxMonthlyPrice}
          onChange={(e) => setMaxMonthlyPrice(e.target.value)}
          inputMode="numeric"
          placeholder="Precio máximo mensual"
          className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px]"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {query.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">Cargando…</p>
        ) : query.isError ? (
          <p className="text-[14px] text-[var(--status-expired)]">
            No pudimos cargar entrenadores.
          </p>
        ) : query.data && query.data.data.length > 0 ? (
          query.data.data.map((trainer) => (
            <article
              key={trainer.id}
              className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-[22px] font-bold text-[var(--text-primary)]">
                  {trainer.displayName}
                </h2>
                <span className="rounded-lg bg-[var(--accent-purple)] px-2.5 py-1 text-[12px] font-semibold text-white">
                  {formatPrice(trainer.monthlyPrice)}
                </span>
              </div>
              <p className="mt-2 text-[12px] font-medium text-[var(--text-secondary)]">
                {trainer.monthlyPrice === null
                  ? 'Suscripción no disponible todavía'
                  : 'Suscripción disponible'}
              </p>
              <p className="mt-3 line-clamp-3 text-[14px] text-[var(--text-secondary)]">
                {trainer.bio ?? 'Este entrenador aún no agregó una bio.'}
              </p>
              <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
                {trainer.experienceYears !== null
                  ? `${trainer.experienceYears} años de experiencia`
                  : 'Experiencia no informada'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trainer.specialties.length > 0 ? (
                  trainer.specialties.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-[var(--border-standard)] px-2.5 py-1 text-[12px] text-[var(--text-secondary)]"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-[12px] text-[var(--text-secondary)]">
                    Sin especialidades cargadas
                  </span>
                )}
              </div>
              <div className="mt-4">
                <Link
                  to={`/entrenadores/${trainer.id}`}
                  className="rounded-xl bg-[var(--accent-purple)] px-4 py-2 text-[14px] font-semibold text-white hover:opacity-90"
                >
                  Ver perfil y suscribirme
                </Link>
              </div>
            </article>
          ))
        ) : (
          <p className="text-[14px] text-[var(--text-secondary)]">
            No encontramos entrenadores para ese criterio.
          </p>
        )}
      </section>
    </div>
  )
}
