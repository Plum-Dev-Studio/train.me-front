import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { fetchCurrentUser } from '@/lib/users'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()

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
        navigate('/login', { replace: true })
        return
      }

      navigate('/login', { replace: true })
    }

    void resolveAuthCallback()

    return () => {
      active = false
    }
  }, [location, navigate])

  return null
}
