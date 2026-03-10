import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import { saveToken, getToken, removeToken } from '../lib/storage'
import type { User } from '@inventory/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

function decodeJWTPayload(token: string): any {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

export function useAuthProvider(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        const payload = decodeJWTPayload(token)
        if (payload && payload.sub) {
          setUser({ id: payload.sub, email: payload.email, name: payload.name ?? '', role: payload.role })
        }
      }
      setIsLoading(false)
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
    if (!res.data) throw new Error(res.error ?? 'Login failed')
    await saveToken(res.data.token)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password })
    if (!res.data) throw new Error(res.error ?? 'Registration failed')
    await saveToken(res.data.token)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    await removeToken()
    setUser(null)
  }, [])

  return { user, isLoading, isAuthenticated: !!user, login, register, logout }
}

export function useAuth() {
  return useContext(AuthContext)
}
