import { ActivityIndicator, View } from 'react-native'
import { Redirect } from 'expo-router'
import { useAuth } from '../hooks/useAuth'

export default function IndexRoute() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return <Redirect href={isAuthenticated ? '/(app)/(tabs)/dashboard' : '/(auth)/login'} />
}
