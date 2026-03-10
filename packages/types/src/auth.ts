export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
}

export interface AuthTokenPayload {
  sub: string
  email: string
  role: 'admin' | 'staff'
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
