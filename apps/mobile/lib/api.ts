import axios from 'axios'
import { getToken } from './storage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<{ data: T; error?: string }>(url, { params }).then((r) => r.data),
  post: <T>(url: string, body?: unknown) =>
    apiClient.post<{ data: T; message?: string; error?: string }>(url, body).then((r) => r.data),
  put: <T>(url: string, body?: unknown) =>
    apiClient.put<{ data: T; message?: string; error?: string }>(url, body).then((r) => r.data),
  delete: <T>(url: string) =>
    apiClient.delete<{ data: T; message?: string; error?: string }>(url).then((r) => r.data),
}
