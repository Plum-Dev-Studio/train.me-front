import {
  Search,
  Bell,
  UserPlus,
  Pencil,
  Ellipsis,
} from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  change: string
  variant?: 'default' | 'accent'
}

function StatCard({ label, value, change, variant = 'default' }: StatCardProps) {
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

type Status = 'active' | 'pending' | 'expired'

interface Client {
  initials: string
  name: string
  email: string
  plan: string
  status: Status
  statusLabel: string
  subscription: string
  color: string
}

const statusStyles: Record<Status, { bg: string; text: string; dot: string }> = {
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
}

const clients: Client[] = [
  {
    initials: 'ML',
    name: 'Maria Lopez',
    email: 'maria@email.com',
    plan: 'Fuerza Total',
    status: 'active',
    statusLabel: 'Activo',
    subscription: 'Mensual',
    color: 'bg-[#8B5CF630] text-[var(--accent-purple)]',
  },
  {
    initials: 'CF',
    name: 'Carlos Fernandez',
    email: 'carlos@email.com',
    plan: 'HIIT Pro',
    status: 'active',
    statusLabel: 'Activo',
    subscription: 'Anual',
    color: 'bg-[#14B8A630] text-[var(--accent-teal)]',
  },
  {
    initials: 'SR',
    name: 'Sofia Rodriguez',
    email: 'sofia@email.com',
    plan: 'Flexibilidad',
    status: 'pending',
    statusLabel: 'Pendiente',
    subscription: 'Mensual',
    color: 'bg-[#F472B630] text-[var(--accent-pink)]',
  },
  {
    initials: 'AG',
    name: 'Andres Garcia',
    email: 'andres@email.com',
    plan: 'Pérdida de Peso',
    status: 'active',
    statusLabel: 'Activo',
    subscription: 'Anual',
    color: 'bg-[#8B5CF630] text-[var(--accent-purple)]',
  },
  {
    initials: 'LP',
    name: 'Laura Perez',
    email: 'laura@email.com',
    plan: 'Cardio Quema',
    status: 'expired',
    statusLabel: 'Vencido',
    subscription: 'Mensual',
    color: 'bg-[#14B8A630] text-[var(--accent-teal)]',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-standard)] px-8 py-5">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[22px] font-bold text-[var(--text-primary)]">
            Buen día, Juan
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
          <StatCard label="Clientes Activos" value="24" change="+3 esta semana" />
          <StatCard label="Planes Activos" value="18" change="+5 este mes" />
          <StatCard label="Suscripciones" value="31" change="+12% ingresos" />
          <StatCard
            label="Ejercicios"
            value="86"
            change="12 personalizados"
            variant="accent"
          />
        </div>

        {/* Table Section */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-[var(--bg-card)]">
          {/* Table Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="font-display text-[18px] font-bold text-[var(--text-primary)]">
              Clientes Recientes
            </h2>
            <button className="flex items-center gap-2 rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90">
              <UserPlus className="h-4 w-4" />
              Agregar Cliente
            </button>
          </div>

          {/* Column Headers */}
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

          {/* Rows */}
          <div className="flex flex-1 flex-col overflow-auto">
            {clients.map((client, i) => {
              const style = statusStyles[client.status]
              return (
                <div
                  key={client.email}
                  className={`flex items-center px-6 py-3.5 ${
                    i < clients.length - 1
                      ? 'border-b border-[#E4E4E720]'
                      : ''
                  }`}
                >
                  {/* Client */}
                  <div className="flex flex-1 items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${client.color}`}
                    >
                      <span className="text-[11px] font-bold">
                        {client.initials}
                      </span>
                    </div>
                    <div className="flex flex-col gap-px">
                      <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                        {client.name}
                      </span>
                      <span className="text-[12px] text-[var(--text-secondary)]">
                        {client.email}
                      </span>
                    </div>
                  </div>

                  {/* Plan */}
                  <span className="w-[180px] text-[14px] font-medium text-[var(--text-primary)]">
                    {client.plan}
                  </span>

                  {/* Status */}
                  <div className="w-[120px]">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${style.bg} ${style.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                      />
                      {client.statusLabel}
                    </span>
                  </div>

                  {/* Subscription */}
                  <span className="w-[120px] text-[14px] font-medium text-[var(--text-primary)]">
                    {client.subscription}
                  </span>

                  {/* Actions */}
                  <div className="flex w-[80px] gap-2">
                    <button
                      aria-label={`Editar ${client.name}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Más opciones para ${client.name}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
