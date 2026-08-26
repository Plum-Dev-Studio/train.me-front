import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router'
import { fetchCurrentUser } from '@/lib/users'

const ERROR_MESSAGES: Record<string, string> = {
  verification_failed: 'El enlace de verificación es inválido o expiró.',
  account_deactivated: 'Tu cuenta fue desactivada.',
  auth_failed: 'Error de autenticación. Intentá de nuevo.',
}

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function resolveAuthCallback() {
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''))
      const token = hashParams.get('token')

      if (token) {
        localStorage.setItem('auth_token', token)
        const redirectTo = localStorage.getItem('post_login_redirect')
        if (redirectTo) {
          localStorage.removeItem('post_login_redirect')
        }
        window.history.replaceState(null, '', location.pathname)
        if (redirectTo) {
          navigate(redirectTo, { replace: true })
          return
        }

        try {
          const currentUser = await fetchCurrentUser()
          if (!active) return
          navigate(currentUser.role === 'trainer' ? '/app' : '/', {
            replace: true,
          })
        } catch {
          localStorage.removeItem('auth_token')
          if (!active) return
          navigate('/login', { replace: true })
        }
        return
      }

      const searchParams = new URLSearchParams(location.search)
      const error = searchParams.get('error')

      if (error) {
        const message =
          ERROR_MESSAGES[error] ?? 'Error de autenticación. Intentá de nuevo.'
        if (!active) return
        setErrorMessage(message)
        return
      }

      navigate('/login', { replace: true })
    }

    void resolveAuthCallback()

    return () => {
      active = false
    }
  }, [location, navigate])

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
