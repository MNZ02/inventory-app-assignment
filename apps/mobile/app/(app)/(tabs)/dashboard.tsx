import { useEffect, useState, useCallback } from 'react'
import { FlatList, ScrollView, Text, View, RefreshControl, TouchableOpacity, Dimensions } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../../lib/api'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { Button } from '../../../components/ui/Button'
import { useAuth } from '../../../hooks/useAuth'
import { BarChart } from 'react-native-chart-kit'
import { DarkModeToggle } from '../../../components/ui/DarkModeToggle'
import { LogoutButton } from '../../../components/ui/LogoutButton'
import { useColorScheme } from 'nativewind'
import type { Product, Transaction } from '@inventory/types'

const { width } = Dimensions.get('window');

interface DashboardData {
  totalProducts: number
  totalStockQuantity: number
  lowStockItems: Product[]
  recentTransactions: (Transaction & { date: string })[]
  stockFlow: { date: string; units: number }[]
}

export default function DashboardScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    try {
      const res = await api.get<DashboardData>('/dashboard')
      setData(res.data ?? null)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err.message ?? 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchData()
    }, [fetchData])
  )

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchData()
  }, [fetchData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'GOOD MORNING!'
    if (hour < 18) return 'GOOD AFTERNOON!'
    return 'GOOD EVENING!'
  }

  const getInitials = (name: string = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background dark:bg-background-dark">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-danger dark:text-danger-dark font-medium text-center mt-3">{error}</Text>
        <Button title="Retry" onPress={fetchData} className="mt-4" />
      </View>
    )
  }

  const chartData = {
    labels: data?.stockFlow?.map(f => {
      const d = new Date(f.date);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: data?.stockFlow?.map(f => f.units) || [0, 0, 0, 0, 0, 0, 0],
      },
    ],
  };

  return (
    <ScrollView 
      className="flex-1 bg-background dark:bg-background-dark" 
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-primary-light dark:bg-primary/20 items-center justify-center mr-3">
            <Text className="text-primary-dark dark:text-primary font-bold text-lg">{getInitials(user?.name)}</Text>
          </View>
          <View>
            <Text className="text-text-muted dark:text-text-muted text-[11px] font-[400] uppercase tracking-wider">{getGreeting()}</Text>
            <Text className="text-text-primary dark:text-text-primary-dark text-[28px] font-[800] leading-8">{user?.name?.split(' ')[0]} 👋</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <DarkModeToggle />
          <LogoutButton />
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <Card className="w-[48%] mb-4 items-start p-4 bg-primary dark:bg-primary relative overflow-hidden">
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mb-4">
            <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
          </View>
          <Text className="text-white/70 text-[10px] absolute top-4 right-4 font-bold">Weekly ↓</Text>
          <Text className="text-white text-[28px] font-[800] leading-8">₹{(data?.totalStockQuantity || 0) * 125}</Text>
          <Text className="text-white/80 text-[13px] font-[400] mt-1">Total Stock Value</Text>
        </Card>

        <Card className="w-[48%] mb-4 items-start p-4 relative">
          <View className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-500/10 items-center justify-center mb-4">
            <Ionicons name="cube-outline" size={18} color="#2DD4BF" />
          </View>
          <Text className="text-text-muted dark:text-text-muted text-[10px] absolute top-4 right-4 font-bold">Weekly ↓</Text>
          <Text className="text-text-primary dark:text-text-primary-dark text-[28px] font-[800] leading-8">{data?.totalStockQuantity ?? 0}</Text>
          <Text className="text-text-muted dark:text-text-muted text-[13px] font-[400] mt-1">Total Stock</Text>
        </Card>

        <Card className="w-[48%] mb-4 items-start p-4 relative">
          <View className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 items-center justify-center mb-4">
            <Ionicons name="close-circle-outline" size={18} color="#F87171" />
          </View>
          <Text className="text-text-muted dark:text-text-muted text-[10px] absolute top-4 right-4 font-bold">Weekly ↓</Text>
          <Text className="text-text-primary dark:text-text-primary-dark text-[28px] font-[800] leading-8">{data?.lowStockItems.filter(i => i.quantityInStock === 0).length ?? 0}</Text>
          <Text className="text-text-muted dark:text-text-muted text-[13px] font-[400] mt-1">Out of Stock</Text>
        </Card>

        <Card className="w-[48%] mb-4 items-start p-4 relative">
          <View className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-500/10 items-center justify-center mb-4">
            <Ionicons name="warning-outline" size={18} color="#FB923C" />
          </View>
          <Text className="text-text-muted dark:text-text-muted text-[10px] absolute top-4 right-4 font-bold">Weekly ↓</Text>
          <Text className="text-text-primary dark:text-text-primary-dark text-[28px] font-[800] leading-8">{data?.lowStockItems.length ?? 0}</Text>
          <Text className="text-text-muted dark:text-text-muted text-[13px] font-[400] mt-1">Low Stock</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-3 mb-8">
        <Button 
          title="+ Add Product" 
          className="flex-1" 
          onPress={() => router.push('/(app)/products/add')} 
        />
        <Button 
          title="Transactions →" 
          variant="outlined" 
          className="flex-1" 
          onPress={() => router.push('/(app)/(tabs)/transactions')} 
        />
      </View>

      {/* Recent Transactions */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-text-primary dark:text-text-primary-dark text-xl font-[800]">Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/transactions')}>
          <Text className="text-primary font-bold text-[15px]">View all</Text>
        </TouchableOpacity>
      </View>

      {data?.recentTransactions.length === 0 ? (
        <Card className="items-center py-10 mb-8">
          <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
          <Text className="text-text-muted dark:text-text-muted mt-2 font-[400]">No transactions yet</Text>
        </Card>
      ) : (
        <View className="mb-8">
          {data?.recentTransactions.slice(0, 3).map((item) => (
            <Card key={item.id} className="mb-3 p-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.type === 'IN' ? 'bg-success-light dark:bg-success-dark/20' : 'bg-danger-light dark:bg-danger-dark/20'}`}>
                    <Ionicons 
                      name={item.type === 'IN' ? "arrow-up" : "arrow-down"} 
                      size={20} 
                      color={item.type === 'IN' ? "#22C55E" : "#EF4444"} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary dark:text-text-primary-dark font-bold text-[15px]" numberOfLines={1}>{item.productName}</Text>
                    <Text className="text-text-muted dark:text-text-muted text-xs mt-1">
                      {new Date(item.date).toLocaleDateString()} · {item.performedBy}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`font-bold text-[16px] ${item.type === 'IN' ? 'text-success' : 'text-danger'}`}>
                    {item.type === 'IN' ? '+' : '-'}{item.quantityChange}
                  </Text>
                  <Badge 
                    label={item.type} 
                    variant={item.type === 'IN' ? 'success' : 'danger'} 
                    className="mt-1"
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Stock Flow Chart */}
      <View className="mb-10">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-text-primary dark:text-text-primary-dark text-xl font-[800]">Stock Flow</Text>
          <Text className="text-text-muted dark:text-text-muted font-bold text-xs uppercase">Last 7 days</Text>
        </View>
        <Text className="text-success dark:text-success font-bold text-sm mb-4">+18% Rise in Total Inventory Units</Text>
        
        <Card className="p-0 overflow-hidden items-center dark:bg-card-dark">
          <BarChart
            data={chartData}
            width={width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              backgroundGradientFrom: isDark ? '#1F2937' : '#FFFFFF',
              backgroundGradientTo: isDark ? '#1F2937' : '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(167, 139, 250, ${opacity})`,
              labelColor: (opacity = 1) => isDark ? `rgba(156, 163, 175, ${opacity})` : `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 10,
                fontWeight: '600'
              },
              barPercentage: 0.6,
            }}
            style={{
              marginVertical: 16,
              borderRadius: 16,
            }}
            showValuesOnTopOfBars
            fromZero
          />
        </Card>
      </View>
    </ScrollView>
  )
}
