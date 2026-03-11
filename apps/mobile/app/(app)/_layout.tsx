import { Stack } from 'expo-router'

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="products/add" />
      <Stack.Screen name="products/[id]" />
      <Stack.Screen name="products/edit/[id]" />
    </Stack>
  )
}
