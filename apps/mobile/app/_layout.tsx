import '../global.css'
import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { AuthContext, useAuthProvider, useAuth } from '../hooks/useAuth'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

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
      router.replace('/(app)/(tabs)/dashboard')
    }
  }, [isAuthenticated, isLoading, segments])

  return <>{children}</>
}

export default function RootLayout() {
  const auth = useAuthProvider()
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  })

  if (!fontsLoaded) return <LoadingSpinner />

  return (
    <AuthContext.Provider value={auth}>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGuard>
    </AuthContext.Provider>
  )
}
