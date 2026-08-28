import { apiFetch } from './api'

interface RegisterInput {
  email: string
  password: string
  fullName: string
}

interface RegisterResponse {
  message: string
}

interface LoginInput {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
  expiresIn: number
}

export function register(input: RegisterInput): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function login(input: LoginInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
