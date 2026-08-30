import { useLocation } from 'react-router'

const pageTitles: Record<string, string> = {
  '/app/clientes': 'Clientes',
  '/app/plantillas': 'Plantillas',
  '/app/planes': 'Planes de Entrenamiento',
  '/app/ejercicios': 'Ejercicios',
  '/app/nutricion': 'Nutrición',
  '/app/agenda': 'Agenda',
  '/app/suscripciones': 'Suscripciones',
  '/app/configuracion': 'Configuración',
}

export default function PlaceholderPage() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Página'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="font-display text-[28px] font-bold text-[var(--text-primary)]">
        {title}
      </h1>
      <p className="text-[16px] text-[var(--text-secondary)]">
        Esta página está en construcción
      </p>
    </div>
  )
}
