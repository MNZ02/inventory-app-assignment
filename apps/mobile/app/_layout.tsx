import '../global.css'
import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { AuthContext, useAuthProvider, useAuth } from '../hooks/useAuth'
import { ThemeProvider, useTheme } from '../hooks/useTheme'
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
  }, [isAuthenticated, isLoading, segments, router])

  return <>{children}</>
}

function RootApp() {
  const { isInitialized } = useTheme()
  const [fontsLoaded] = useFonts({ 
    Inter_400Regular, 
    Inter_500Medium, 
    Inter_600SemiBold, 
    Inter_700Bold 
  })

  if (!fontsLoaded || !isInitialized) return <LoadingSpinner />

  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthGuard>
  )
}

export default function RootLayout() {
  const auth = useAuthProvider()

  return (
    <AuthContext.Provider value={auth}>
      <ThemeProvider>
        <RootApp />
      </ThemeProvider>
    </AuthContext.Provider>
  )
}
