import { NavLink } from 'react-router'
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  CreditCard,
  Settings,
} from 'lucide-react'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import { initialsFromFullName } from '@/lib/trainerDashboard'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Panel' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/planes', icon: ClipboardList, label: 'Planes de Entrenamiento' },
  { to: '/ejercicios', icon: Dumbbell, label: 'Ejercicios' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/suscripciones', icon: CreditCard, label: 'Suscripciones' },
]

export function Sidebar() {
  const dashboard = useTrainerDashboard()
  const displayName = dashboard.data?.trainer.displayName
  const initials = displayName ? initialsFromFullName(displayName) : '…'

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-[var(--bg-sidebar)] px-5 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 pb-6">
        <Dumbbell className="h-7 w-7 text-[var(--accent-purple)]" />
        <span className="font-display text-[22px] font-extrabold text-white">
          train.me
        </span>
      </div>

      {/* Nav Section */}
      <nav className="flex flex-col gap-1">
        <span className="mb-1 text-[11px] font-semibold text-[#FFFFFF50]">
          MENÚ
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] transition-colors ${
                isActive
                  ? 'bg-[#FFFFFF15] font-semibold text-white'
                  : 'font-medium text-[var(--text-on-dark-muted)] hover:bg-[#FFFFFF10]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 ${isActive ? 'text-[var(--accent-purple)]' : 'text-[#FFFFFFB3]'}`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Nav */}
      <div className="flex flex-col gap-1">
        <div className="mb-1 h-px w-full bg-[#FFFFFF15]" />
        <NavLink
          to="/configuracion"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] transition-colors ${
              isActive
                ? 'bg-[#FFFFFF15] font-semibold text-white'
                : 'font-medium text-[var(--text-on-dark-muted)] hover:bg-[#FFFFFF10]'
            }`
          }
        >
          <Settings className="h-5 w-5 text-[#FFFFFFB3]" />
          Configuración
        </NavLink>
      </div>

      {/* Profile */}
      <div className="mt-3 flex items-center gap-3 px-1 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-purple)]">
          <span className="text-[13px] font-bold text-white">{initials}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[14px] font-semibold text-white">
            {dashboard.isPending
              ? 'Cargando…'
              : dashboard.isError
                ? 'Entrenador'
                : (displayName ?? 'Entrenador')}
          </span>
          <span className="text-[12px] text-[#FFFFFFB3]">
            Entrenador Personal
          </span>
        </div>
      </div>
    </aside>
  )
}
