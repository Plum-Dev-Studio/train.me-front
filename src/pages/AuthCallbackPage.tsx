import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, Link } from 'react-router'

const ERROR_MESSAGES: Record<string, string> = {
  verification_failed: 'El enlace de verificación es inválido o expiró.',
  account_deactivated: 'Tu cuenta fue desactivada.',
  auth_failed: 'Error de autenticación. Intentá de nuevo.',
}

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const hashParams = useMemo(
    () => new URLSearchParams(location.hash.replace(/^#/, '')),
    [location.hash],
  )
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )

  const token = hashParams.get('token')
  const error = searchParams.get('error')
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? null) : null

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token)
      window.history.replaceState(null, '', location.pathname)
      navigate('/', { replace: true })
      return
    }

    if (!errorMessage) {
      navigate('/login', { replace: true })
    }
  }, [token, errorMessage, location.pathname, navigate])

  if (!errorMessage) return null

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--bg-page)]">
      <div className="flex max-w-[400px] flex-col items-center gap-4 text-center">
        <p className="text-[15px] text-[var(--status-expired)]">
          {errorMessage}
        </p>
        <Link
          to="/login"
          className="text-[14px] font-semibold text-[var(--accent-purple)]"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
