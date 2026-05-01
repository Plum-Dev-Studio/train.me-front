import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

export default function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''))
    const token = hashParams.get('token')

    if (token) {
      localStorage.setItem('auth_token', token)
      const redirectTo = localStorage.getItem('post_login_redirect')
      if (redirectTo) {
        localStorage.removeItem('post_login_redirect')
      }
      window.history.replaceState(null, '', location.pathname)
      navigate(redirectTo || '/app', { replace: true })
      return
    }

    const searchParams = new URLSearchParams(location.search)
    const error = searchParams.get('error')

    if (error) {
      navigate('/login', { replace: true })
      return
    }

    navigate('/login', { replace: true })
  }, [location, navigate])

  return null
}
