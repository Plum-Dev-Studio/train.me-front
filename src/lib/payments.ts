import { apiFetch } from './api'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

export interface MercadoPagoConnectResponse {
  authorizationUrl: string
}

export interface MercadoPagoConnectionStatus {
  isConnected: boolean
  mpUserId?: number
  isActive?: boolean
  tokenExpiresAt?: string
}

export async function getMercadoPagoConnectUrl(): Promise<string> {
  const response = await apiFetch<MercadoPagoConnectResponse>(
    '/payments/mercadopago/connect',
  )
  return response.authorizationUrl
}

export async function getMercadoPagoConnectionStatus(): Promise<MercadoPagoConnectionStatus> {
  return apiFetch<MercadoPagoConnectionStatus>('/payments/mercadopago/status')
}

export async function disconnectMercadoPago(): Promise<void> {
  const token = localStorage.getItem('auth_token')
  const response = await fetch(`${API_BASE}/payments/mercadopago/disconnect`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error(`MercadoPago disconnect failed (${response.status})`)
  }
}
