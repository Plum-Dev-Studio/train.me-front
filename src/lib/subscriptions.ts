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

export async function createSubscriptionCheckout(
  input: CreateSubscriptionCheckoutInput,
): Promise<CreateSubscriptionCheckoutResponse> {
  return apiFetch<CreateSubscriptionCheckoutResponse>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getSubscriptionById(
  id: string,
): Promise<SubscriptionResponse> {
  return apiFetch<SubscriptionResponse>(`/subscriptions/${id}`)
}
