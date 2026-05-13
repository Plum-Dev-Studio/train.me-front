import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Dumbbell } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { register } from '@/lib/auth'
import { ApiError } from '@/lib/api'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleGoogleLogin() {
    window.location.href = `${API_BASE}/auth/google`
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await register({ email, password, fullName })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { message?: string } | null
        setError(body?.message ?? 'Error al crear la cuenta')
      } else {
        setError('Error al crear la cuenta')
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
        {success ? (
          <div className="flex w-full max-w-[400px] flex-col items-center gap-4 text-center">
            <h2 className="font-display text-[28px] font-bold text-[var(--text-primary)]">
              Revisá tu bandeja de entrada
            </h2>
            <p className="text-[15px] text-[var(--text-secondary)]">
              Te enviamos un email con un enlace para verificar tu cuenta.
            </p>
            <Link
              to="/login"
              className="text-[14px] font-semibold text-[var(--accent-purple)]"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-[400px] flex-col gap-8"
          >
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-[28px] font-bold text-[var(--text-primary)]">
                Creá tu cuenta
              </h2>
              <p className="text-[15px] text-[var(--text-secondary)]">
                Registrate para empezar
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
              <p className="text-[14px] text-[var(--status-expired)]">
                {error}
              </p>
            )}

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
              <Input
                id="fullName"
                name="fullName"
                type="text"
                label="Nombre completo"
                placeholder="Juan Pérez"
                required
                autoComplete="name"
              />

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
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {/* Submit */}
            <Button type="submit" loading={loading}>
              Crear cuenta
            </Button>

            {/* Login Link */}
            <div className="flex items-center justify-center gap-1">
              <span className="text-[14px] text-[var(--text-secondary)]">
                ¿Ya tenés cuenta?
              </span>
              <Link
                to="/login"
                className="text-[14px] font-semibold text-[var(--accent-purple)]"
              >
                Iniciá sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
