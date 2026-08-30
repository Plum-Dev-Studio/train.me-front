import { apiFetch } from './api'
import type { SubscriptionPendingReason } from './subscriptionPending'

export interface CreateSubscriptionCheckoutInput {
  trainerId: string
  planType: 'monthly'
}

export interface CreateSubscriptionCheckoutResponse {
  subscriptionId: string
  paymentId: string
  preferenceId: string
  checkoutUrl: string
}

export interface SubscriptionResponse {
  id: string
  userId: string
  trainerId: string
  planType: 'monthly' | 'annual'
  status: 'pending' | 'active' | 'canceled' | 'expired'
  startDate: string | null
  endDate: string | null
  canceledAt: string | null
  lastPaymentStatus?:
    | 'created'
    | 'approved'
    | 'rejected'
    | 'refunded'
    | 'chargeback'
    | null
  pendingReason?: SubscriptionPendingReason | null
  canRetryPayment?: boolean
}

export interface SubscriptionListResponse {
  data: SubscriptionResponse[]
  total: number
  page: number
  limit: number
}

export async function createSubscriptionCheckout(
  input: CreateSubscriptionCheckoutInput,
): Promise<CreateSubscriptionCheckoutResponse> {
  return apiFetch<CreateSubscriptionCheckoutResponse>(
    '/subscriptions/checkout',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export async function getSubscriptionById(
  id: string,
): Promise<SubscriptionResponse> {
  return apiFetch<SubscriptionResponse>(`/subscriptions/${id}`)
}

export async function listTrainerSubscriptions(
  page: number = 1,
  limit: number = 20,
): Promise<SubscriptionListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return apiFetch<SubscriptionListResponse>(
    `/subscriptions/trainer/me?${params.toString()}`,
  )
}

export async function fetchMySubscription(): Promise<SubscriptionResponse> {
  return apiFetch<SubscriptionResponse>('/subscriptions/me')
}

export async function retrySubscriptionCheckout(): Promise<CreateSubscriptionCheckoutResponse> {
  return apiFetch<CreateSubscriptionCheckoutResponse>(
    '/subscriptions/me/retry-checkout',
    { method: 'POST' },
  )
}
