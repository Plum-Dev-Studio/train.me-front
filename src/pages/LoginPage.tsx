import type { FormEvent } from 'react'
import { Dumbbell } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export default function LoginPage() {
  function handleGoogleLogin() {
    window.location.href = `${API_BASE}/auth/google`
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: call login mutation with FormData from e.currentTarget
  }

  return (
    <div className="flex h-full w-full bg-[var(--bg-page)]">
      {/* Brand Panel */}
      <div className="hidden w-[560px] shrink-0 flex-col justify-between bg-[var(--bg-sidebar)] p-12 lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Dumbbell className="h-8 w-8 text-[var(--accent-purple)]" />
          <span className="font-display text-[26px] font-extrabold text-white">
            train.me
          </span>
        </div>

        {/* Tagline */}
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[40px] font-extrabold leading-[1.1] text-white">
            Tu entrenamiento,{'\n'}un nuevo nivel
          </h1>
          <p className="text-[16px] leading-[1.5] text-[var(--text-on-dark-muted)]">
            Encontrá al entrenador ideal o hacé crecer tu carrera fitness. Todo
            en una sola plataforma.
          </p>
        </div>

        {/* Footer */}
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
          <Button type="submit">Iniciar sesión</Button>

          {/* Sign Up Link */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-[14px] text-[var(--text-secondary)]">
              ¿No tenés cuenta?
            </span>
            <a
              href="#"
              className="text-[14px] font-semibold text-[var(--accent-purple)]"
            >
              Registrate
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
