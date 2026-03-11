import { Alert, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { useColorScheme } from 'nativewind'

export function LogoutButton() {
  const router = useRouter()
  const { logout } = useAuth()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  return (
    <TouchableOpacity
      onPress={handleLogout}
      className="w-10 h-10 rounded-full border border-border dark:border-border-dark items-center justify-center ml-2 bg-card dark:bg-card-dark"
      accessibilityRole="button"
      accessibilityLabel="Sign out"
    >
      <Ionicons name="log-out-outline" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
    </TouchableOpacity>
  )
}
