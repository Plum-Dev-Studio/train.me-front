import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="font-display text-4xl font-bold text-[var(--text-primary)]">
        404
      </h1>
      <p className="text-lg text-[var(--text-secondary)]">
        Página no encontrada
      </p>
      <Link
        to="/"
        className="text-[var(--accent-purple)] underline hover:opacity-80"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
