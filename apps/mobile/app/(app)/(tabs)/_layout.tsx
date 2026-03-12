import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'nativewind'

export default function TabsLayout() {
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Products',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions/index"
        options={{
          title: 'Activity',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
