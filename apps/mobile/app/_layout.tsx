import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { AuthContext, useAuthProvider, useAuth } from '../hooks/useAuth'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)/dashboard')
    }
  }, [isAuthenticated, isLoading, segments])

  return <>{children}</>
}

export default function RootLayout() {
  const auth = useAuthProvider()

  return (
    <AuthContext.Provider value={auth}>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGuard>
    </AuthContext.Provider>
  )
}
