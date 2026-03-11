import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="products/add" options={{ headerShown: false }} />
      <Stack.Screen name="products/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="products/edit/[id]" options={{ headerShown: false }} />
    </Stack>
  )
}
