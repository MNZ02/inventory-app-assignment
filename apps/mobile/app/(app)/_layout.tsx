import { Stack } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'

export default function AppLayout() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="(tabs)" options={{ title: 'Inventory' }} />
      <Stack.Screen name="products/add" options={{ title: 'Add Product' }} />
      <Stack.Screen name="products/[id]" options={{ title: 'Product Detail' }} />
      <Stack.Screen name="products/edit/[id]" options={{ title: 'Edit Product' }} />
    </Stack>
  )
}
