import api from './axios'
import type { AuthResponse, User } from '../types/api'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    '/auth/register',
    payload,
  )

  return data
}

export async function login(
  payload: LoginPayload,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    '/auth/login',
    payload,
  )

  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me')

  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
