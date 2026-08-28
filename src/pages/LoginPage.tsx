import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Dumbbell } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { login } from '@/lib/auth'
import { fetchCurrentUser } from '@/lib/users'
import { resolvePostLoginPath } from '@/lib/postLogin'
import { ApiError } from '@/lib/api'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleGoogleLogin() {
    window.location.href = `${API_BASE}/auth/google`
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { accessToken } = await login({ email, password })
      localStorage.setItem('auth_token', accessToken)
      try {
        const path = await resolvePostLoginPath(fetchCurrentUser)
        navigate(path, { replace: true })
      } catch {
        localStorage.removeItem('auth_token')
        setError('Error al iniciar sesión')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { message?: string; error?: string } | null
        if (body?.error === 'EMAIL_NOT_VERIFIED') {
          setError(
            'Tu email aún no fue verificado. Revisá tu bandeja de entrada.',
          )
        } else if (body?.error === 'ACCOUNT_DEACTIVATED') {
          setError('Tu cuenta fue desactivada.')
        } else {
          setError('Email o contraseña incorrectos')
        }
      } else {
        setError('Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full bg-[var(--bg-page)]">
      {/* Brand Panel */}
      <div className="hidden w-[560px] shrink-0 flex-col justify-between bg-[var(--bg-sidebar)] p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <Dumbbell className="h-8 w-8 text-[var(--accent-purple)]" />
          <span className="font-display text-[26px] font-extrabold text-white">
            train.me
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[40px] font-extrabold leading-[1.1] text-white">
            Tu entrenamiento,{'\n'}un nuevo nivel
          </h1>
          <p className="text-[16px] leading-[1.5] text-[var(--text-on-dark-muted)]">
            Encontrá al entrenador ideal o hacé crecer tu carrera fitness. Todo
            en una sola plataforma.
          </p>
        </div>

        <p className="text-[12px] text-[#FFFFFF50]">
          © 2026 train.me — Todos los derechos reservados
        </p>
      </div>

      {/* Form Panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-20">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-[400px] flex-col gap-8"
        >
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[28px] font-bold text-[var(--text-primary)]">
              Entrá a train.me
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)]">
              Iniciá sesión para continuar
            </p>
          </div>

          {/* Google Button */}
          <Button type="button" variant="outline" onClick={handleGoogleLogin}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            <span className="text-[14px] font-medium">
              Continuar con Google
            </span>
          </Button>

          {/* Divider */}
          <div className="flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border-standard)]" />
            <span className="text-[13px] text-[var(--text-tertiary)]">o</span>
            <div className="h-px flex-1 bg-[var(--border-standard)]" />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[14px] text-[var(--status-expired)]">{error}</p>
          )}

          {/* Form Fields */}
          <div className="flex flex-col gap-5">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="nombre@email.com"
              required
              autoComplete="email"
            />

            <PasswordInput
              id="password"
              name="password"
              label="Contraseña"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              labelAction={
                <a
                  href="#"
                  className="text-[13px] font-medium text-[var(--accent-purple)]"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              }
            />
          </div>

          {/* Submit */}
          <Button type="submit" loading={loading}>
            Iniciar sesión
          </Button>

          {/* Sign Up Link */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-[14px] text-[var(--text-secondary)]">
              ¿No tenés cuenta?
            </span>
            <Link
              to="/register"
              className="text-[14px] font-semibold text-[var(--accent-purple)]"
            >
              Registrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
