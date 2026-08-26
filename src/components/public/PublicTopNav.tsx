import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { fetchCurrentUser } from '@/lib/users'

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
}

export function PublicTopNav() {
  const token = localStorage.getItem('auth_token')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
  })

  const currentUser = currentUserQuery.data

  const displayName = useMemo(() => {
    if (!currentUser) return ''
    const emailPrefix = currentUser.email.split('@')[0] ?? currentUser.email
    return emailPrefix
  }, [currentUser])

  const initials = displayName ? initialsFromName(displayName) : '??'

  function handleLogout() {
    localStorage.removeItem('auth_token')
    queryClient.removeQueries({ queryKey: ['currentUser'] })
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-standard)] bg-[color:color-mix(in_oklab,var(--bg-page)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-6">
        <Link
          to="/entrenadores"
          className="font-display text-[22px] font-extrabold text-[var(--text-primary)]"
        >
          train.me
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/entrenadores"
            className="rounded-lg px-3 py-2 text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
          >
            Entrenadores
          </Link>

          {!token || currentUserQuery.isError ? (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-[var(--border-standard)] px-3 py-2 text-[14px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-[var(--accent-purple)] px-3 py-2 text-[14px] font-semibold text-white hover:opacity-90"
              >
                Crear cuenta
              </Link>
            </>
          ) : currentUserQuery.isPending ? (
            <div className="h-10 w-28 animate-pulse rounded-lg bg-[var(--bg-card)]" />
          ) : (
            <div className="relative">
              <button
                type="button"
                aria-label="Abrir menú de usuario"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-[var(--border-standard)] bg-[var(--bg-card)] px-2 py-1.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-purple)] text-[12px] font-bold text-white">
                  {initials}
                </div>
                <span className="max-w-32 truncate text-[14px] font-medium text-[var(--text-primary)]">
                  {displayName}
                </span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-12 z-50 flex min-w-52 flex-col rounded-xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-1 shadow-lg">
                  {currentUser?.role === 'trainer' ? (
                    <Link
                      to="/app"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-page)]"
                    >
                      Ir a mi panel
                    </Link>
                  ) : (
                    <Link
                      to="/"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-page)]"
                    >
                      Mi inicio
                    </Link>
                  )}
                  <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-page)]"
                  >
                    Editar perfil
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-left text-[14px] text-[var(--status-expired)] hover:bg-[var(--bg-page)]"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
