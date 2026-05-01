import { apiFetch } from './api'

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
