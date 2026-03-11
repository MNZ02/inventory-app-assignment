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

export const uploadProductImage = async (fileUri: string) => {
  try {
    const { data: signData } = await api.get<{
      timestamp: number
      signature: string
      cloudName: string
      apiKey: string
      folder: string
    }>('/upload/sign')

    const formData = new FormData()
    // Using any for formData.append as React Native's FormData typing can be restrictive
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any)
    formData.append('api_key', signData.apiKey)
    formData.append('timestamp', signData.timestamp.toString())
    formData.append('signature', signData.signature)
    formData.append('folder', signData.folder)

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const uploadData = await uploadRes.json()
    if (!uploadRes.ok) {
      throw new Error(uploadData.error?.message || 'Upload failed')
    }

    return uploadData.secure_url as string
  } catch (error) {
    console.error('Image upload failed:', error)
    throw error
  }
}
