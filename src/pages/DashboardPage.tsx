import { Search, Bell, UserPlus, Pencil, Ellipsis } from 'lucide-react'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import {
  initialsFromFullName,
  mapTrainerClientStatus,
  planTypeLabel,
  type TrainerDashboardRecentClient,
  type TrainerDashboardResponse,
  type UiClientStatus,
} from '@/lib/trainerDashboard'

interface StatCardProps {
  label: string
  value: string
  change: string
  variant?: 'default' | 'accent'
}

function StatCard({
  label,
  value,
  change,
  variant = 'default',
}: StatCardProps) {
  const isAccent = variant === 'accent'
  return (
    <div
      className={`flex flex-1 flex-col gap-2 rounded-[20px] p-6 ${
        isAccent ? 'bg-[var(--accent-purple)]' : 'bg-[var(--bg-card)]'
      }`}
    >
      <span
        className={`text-[13px] font-medium ${isAccent ? 'text-[#FFFFFFB3]' : 'text-[var(--text-secondary)]'}`}
      >
        {label}
      </span>
      <span
        className={`font-display text-[32px] font-extrabold ${isAccent ? 'text-white' : 'text-[var(--text-primary)]'}`}
      >
        {value}
      </span>
      <span
        className={`text-[12px] font-semibold ${isAccent ? 'text-[#FFFFFFB3]' : 'text-[var(--accent-teal)]'}`}
      >
        {change}
      </span>
    </div>
  )
}

const statusStyles: Record<
  UiClientStatus,
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: 'bg-[#22C55E20]',
    text: 'text-[#22C55E]',
    dot: 'bg-[var(--status-active)]',
  },
  pending: {
    bg: 'bg-[#F59E0B20]',
    text: 'text-[#F59E0B]',
    dot: 'bg-[var(--status-pending)]',
  },
  expired: {
    bg: 'bg-[#EF444420]',
    text: 'text-[#EF4444]',
    dot: 'bg-[var(--status-expired)]',
  },
  canceled: {
    bg: 'bg-[#64748B25]',
    text: 'text-[#64748B]',
    dot: 'bg-[#64748B]',
  },
}

const avatarColorClasses = [
  'bg-[#8B5CF630] text-[var(--accent-purple)]',
  'bg-[#14B8A630] text-[var(--accent-teal)]',
  'bg-[#F472B630] text-[var(--accent-pink)]',
]

function avatarClassForIndex(index: number): string {
  return avatarColorClasses[index % avatarColorClasses.length]!
}

export interface DashboardContentProps {
  data: TrainerDashboardResponse
}

export function DashboardContent({ data }: DashboardContentProps) {
  const { trainer, stats, recentClients } = data

  const clientsSubtitle =
    stats.newClientsThisWeek > 0
      ? `+${stats.newClientsThisWeek} esta semana`
      : 'Sin altas esta semana'

  const plansSubtitle =
    stats.plansCreatedThisMonth > 0
      ? `+${stats.plansCreatedThisMonth} este mes`
      : 'Sin planes nuevos este mes'

  const subscriptionsSubtitle = `${stats.activeSubscriptions} activas`

  const exercisesSubtitle =
    stats.customExercises > 0
      ? `${stats.customExercises} personalizados`
      : 'Ninguno personalizado aún'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-standard)] px-8 py-5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[22px] font-bold text-[var(--text-primary)]">
            Buen día, {trainer.greetingName}
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Esto es lo que está pasando con tus clientes hoy
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-[var(--bg-card)] px-4 py-2.5">
            <Search className="h-4 w-4 text-[var(--text-tertiary)]" />
            <span className="text-[14px] text-[var(--text-tertiary)]">
              Buscar...
            </span>
          </div>
          <button
            type="button"
            aria-label="Notificaciones"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-card)]"
          >
            <Bell className="h-[18px] w-[18px] text-[var(--text-primary)]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-7 overflow-auto p-8">
        {/* Stats Row */}
        <div className="flex gap-4">
          <StatCard
            label="Clientes Activos"
            value={String(stats.activeClients)}
            change={clientsSubtitle}
          />
          <StatCard
            label="Planes Activos"
            value={String(stats.activePlans)}
            change={plansSubtitle}
          />
          <StatCard
            label="Suscripciones"
            value={String(stats.activeSubscriptions)}
            change={subscriptionsSubtitle}
          />
          <StatCard
            label="Ejercicios"
            value={String(stats.totalExercises)}
            change={exercisesSubtitle}
            variant="accent"
          />
        </div>

        {/* Table Section */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-[var(--bg-card)]">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="font-display text-[18px] font-bold text-[var(--text-primary)]">
              Clientes Recientes
            </h2>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Agregar Cliente
            </button>
          </div>

          <div className="flex items-center border-b border-[var(--border-standard)] px-6 py-3">
            <span className="flex-1 text-[12px] font-semibold text-[var(--text-secondary)]">
              Cliente
            </span>
            <span className="w-[180px] text-[12px] font-semibold text-[var(--text-secondary)]">
              Plan
            </span>
            <span className="w-[120px] text-[12px] font-semibold text-[var(--text-secondary)]">
              Estado
            </span>
            <span className="w-[120px] text-[12px] font-semibold text-[var(--text-secondary)]">
              Suscripción
            </span>
            <span className="w-[80px] text-[12px] font-semibold text-[var(--text-secondary)]">
              Acciones
            </span>
          </div>

          <div className="flex flex-1 flex-col overflow-auto">
            {recentClients.length === 0 ? (
              <p className="px-6 py-8 text-[14px] text-[var(--text-secondary)]">
                Todavía no tenés clientes recientes para mostrar.
              </p>
            ) : (
              recentClients.map((client: TrainerDashboardRecentClient, i) => {
                const { ui, label: statusLabel } = mapTrainerClientStatus(
                  client.status,
                )
                const style = statusStyles[ui]
                const initials = initialsFromFullName(client.fullName)
                return (
                  <div
                    key={client.trainerClientId}
                    className={`flex items-center px-6 py-3.5 ${
                      i < recentClients.length - 1
                        ? 'border-b border-[#E4E4E720]'
                        : ''
                    }`}
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${avatarClassForIndex(i)}`}
                      >
                        <span className="text-[11px] font-bold">
                          {initials}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-col gap-px">
                        <span className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
                          {client.fullName}
                        </span>
                        <span className="truncate text-[12px] text-[var(--text-secondary)]">
                          {client.email}
                        </span>
                      </div>
                    </div>

                    <span className="w-[180px] truncate text-[14px] font-medium text-[var(--text-primary)]">
                      {client.planName ?? '—'}
                    </span>

                    <div className="w-[120px]">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${style.bg} ${style.text}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                        />
                        {statusLabel}
                      </span>
                    </div>

                    <span className="w-[120px] text-[14px] font-medium text-[var(--text-primary)]">
                      {planTypeLabel(client.planType)}
                    </span>

                    <div className="flex w-[80px] gap-2">
                      <button
                        type="button"
                        aria-label={`Editar ${client.fullName}`}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Más opciones para ${client.fullName}`}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <Ellipsis className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isPending, isError, error, refetch, isFetching } =
    useTrainerDashboard()

  if (isPending) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
        <p className="text-[14px] text-[var(--text-secondary)]">
          Cargando panel…
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="max-w-md text-center text-[14px] text-[var(--text-secondary)]">
          No pudimos cargar tu panel
          {error?.message ? ` (${error.message})` : ''}.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return <DashboardContent data={data} />
}
