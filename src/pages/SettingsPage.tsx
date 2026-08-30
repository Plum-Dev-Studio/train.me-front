import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { getMercadoPagoOAuthCallbackMessage } from '@/lib/mercadoPagoOAuthCallback'
import { fetchCurrentUser } from '@/lib/users'
import {
  fetchTrainerProfileByUserId,
  updateTrainerProfileByUserId,
} from '@/lib/trainerProfiles'
import {
  disconnectMercadoPago,
  getMercadoPagoConnectionStatus,
  getMercadoPagoConnectUrl,
} from '@/lib/payments'
import { QuestionnaireSettingsSection } from '@/components/QuestionnaireSettingsSection'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [bio, setBio] = useState<string | null>(null)
  const [monthlyPrice, setMonthlyPrice] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState<boolean | null>(null)
  const [contactWhatsapp, setContactWhatsapp] = useState<string | null>(null)
  const [contactEmail, setContactEmail] = useState<string | null>(null)
  const [contactInstagram, setContactInstagram] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
  })

  const profileQuery = useQuery({
    queryKey: ['trainerProfile', currentUserQuery.data?.id],
    queryFn: () => fetchTrainerProfileByUserId(currentUserQuery.data!.id),
    enabled: Boolean(currentUserQuery.data?.id),
  })

  const mpStatusQuery = useQuery({
    queryKey: ['mercadoPagoStatus'],
    queryFn: getMercadoPagoConnectionStatus,
    enabled: currentUserQuery.data?.role === 'trainer',
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('status')
    if (!status) {
      return
    }

    const callbackMessage = getMercadoPagoOAuthCallbackMessage(
      status,
      params.get('reason'),
    )
    if (callbackMessage) {
      // OAuth redirect lands with query params; persist feedback before clearing URL.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- external redirect URL
      setMessage(callbackMessage)
    }

    if (status === 'success') {
      void queryClient.invalidateQueries({ queryKey: ['mercadoPagoStatus'] })
    }

    navigate({ pathname: location.pathname, search: '' }, { replace: true })
  }, [location.pathname, location.search, navigate, queryClient])

  const resolvedDisplayName =
    displayName ?? profileQuery.data?.displayName ?? ''
  const resolvedBio = bio ?? profileQuery.data?.bio ?? ''
  const resolvedMonthlyPrice =
    monthlyPrice ??
    (profileQuery.data?.monthlyPrice !== null &&
    profileQuery.data?.monthlyPrice !== undefined
      ? String(profileQuery.data.monthlyPrice)
      : '')
  const resolvedIsPublic = isPublic ?? profileQuery.data?.isPublic ?? true
  const resolvedContactWhatsapp =
    contactWhatsapp ?? profileQuery.data?.contactWhatsapp ?? ''
  const resolvedContactEmail =
    contactEmail ?? profileQuery.data?.contactEmail ?? ''
  const resolvedContactInstagram =
    contactInstagram ?? profileQuery.data?.contactInstagram ?? ''

  const saveMutation = useMutation({
    mutationFn: async () => {
      const priceValue =
        resolvedMonthlyPrice.trim() === ''
          ? null
          : Number.parseFloat(resolvedMonthlyPrice)
      if (
        priceValue !== null &&
        (!Number.isFinite(priceValue) || priceValue <= 0)
      ) {
        throw new Error('El precio mensual debe ser un número mayor a 0.')
      }
      return updateTrainerProfileByUserId(currentUserQuery.data!.id, {
        displayName: resolvedDisplayName.trim(),
        bio: resolvedBio.trim() === '' ? null : resolvedBio.trim(),
        monthlyPrice: priceValue,
        isPublic: resolvedIsPublic,
        contactWhatsapp:
          resolvedContactWhatsapp.trim() === ''
            ? null
            : resolvedContactWhatsapp.trim(),
        contactEmail:
          resolvedContactEmail.trim() === ''
            ? null
            : resolvedContactEmail.trim(),
        contactInstagram:
          resolvedContactInstagram.trim() === ''
            ? null
            : resolvedContactInstagram.trim(),
      })
    },
    onSuccess: async () => {
      setMessage('Perfil actualizado correctamente.')
      setDisplayName(null)
      setBio(null)
      setMonthlyPrice(null)
      setIsPublic(null)
      setContactWhatsapp(null)
      setContactEmail(null)
      setContactInstagram(null)
      await queryClient.invalidateQueries({
        queryKey: ['trainerProfile', currentUserQuery.data?.id],
      })
      await queryClient.invalidateQueries({ queryKey: ['trainerDashboard'] })
      await queryClient.invalidateQueries({ queryKey: ['public-trainers'] })
    },
    onError: (error) => {
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar.')
    },
  })

  const connectMutation = useMutation({
    mutationFn: async () => {
      const url = await getMercadoPagoConnectUrl()
      window.location.href = url
    },
    onError: () => {
      setMessage('No pudimos iniciar la conexión con Mercado Pago.')
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: disconnectMercadoPago,
    onSuccess: async () => {
      setMessage('Cuenta de Mercado Pago desconectada.')
      await queryClient.invalidateQueries({ queryKey: ['mercadoPagoStatus'] })
    },
    onError: () => {
      setMessage('No pudimos desconectar Mercado Pago.')
    },
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Configuración"
        description="Gestioná tu perfil público, precio y conexión de cobros"
      />

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-8">
        {message ? (
          <p
            role="status"
            className="rounded-xl border border-[var(--border-standard)] bg-[var(--bg-page)] px-4 py-3 text-[14px] text-[var(--text-secondary)]"
          >
            {message}
          </p>
        ) : null}
        {currentUserQuery.isPending || profileQuery.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">Cargando…</p>
        ) : currentUserQuery.isError || profileQuery.isError ? (
          <p className="text-[14px] text-[var(--status-expired)]">
            No pudimos cargar la configuración.
          </p>
        ) : (
          <>
            <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
              <h2 className="font-display text-[20px] font-bold text-[var(--text-primary)]">
                Perfil de entrenador
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
                  Nombre público
                  <input
                    value={resolvedDisplayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
                  Precio mensual (ARS)
                  <input
                    value={resolvedMonthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    inputMode="decimal"
                    placeholder="Ej: 25000"
                    className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
                  Bio
                  <textarea
                    value={resolvedBio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  />
                </label>
                <label className="md:col-span-2 inline-flex items-center gap-2 text-[14px] text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={resolvedIsPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border-standard)]"
                  />
                  Mostrar mi perfil en el buscador público
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
              <h2 className="font-display text-[20px] font-bold text-[var(--text-primary)]">
                Canales de contacto
              </h2>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Opcional. Tus alumnos y visitantes del perfil público podrán
                contactarte.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
                  WhatsApp
                  <input
                    value={resolvedContactWhatsapp}
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    inputMode="tel"
                    placeholder="54911…"
                    className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  />
                  <span className="text-[12px]">
                    Solo números con código de país (ej. 549…)
                  </span>
                </label>
                <label className="flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
                  Email público
                  <input
                    value={resolvedContactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    type="email"
                    placeholder="coach@…"
                    className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  />
                  <span className="text-[12px]">
                    No reemplaza el email de login
                  </span>
                </label>
                <label className="md:col-span-2 flex flex-col gap-1 text-[13px] text-[var(--text-secondary)]">
                  Instagram
                  <input
                    value={resolvedContactInstagram}
                    onChange={(e) => setContactInstagram(e.target.value)}
                    placeholder="miusuario"
                    className="rounded-lg border border-[var(--border-standard)] bg-transparent px-3 py-2 text-[14px] text-[var(--text-primary)]"
                  />
                  <span className="text-[12px]">Sin @</span>
                </label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Guardando…' : 'Guardar contacto'}
                </button>
              </div>
            </section>

            <QuestionnaireSettingsSection />

            <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
              <h2 className="font-display text-[20px] font-bold text-[var(--text-primary)]">
                Cobros con Mercado Pago
              </h2>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Estado:{' '}
                <strong>
                  {mpStatusQuery.data?.isConnected
                    ? 'Conectado'
                    : 'No conectado'}
                </strong>
              </p>
              <div className="mt-4 flex gap-3">
                {mpStatusQuery.data?.isConnected ? (
                  <button
                    type="button"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    className="rounded-xl border border-[var(--border-standard)] px-5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-page)] disabled:opacity-50"
                  >
                    {disconnectMutation.isPending
                      ? 'Desconectando…'
                      : 'Desconectar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => connectMutation.mutate()}
                    disabled={connectMutation.isPending}
                    className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {connectMutation.isPending
                      ? 'Conectando…'
                      : 'Conectar cuenta'}
                  </button>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
