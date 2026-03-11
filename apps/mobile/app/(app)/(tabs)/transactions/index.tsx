import { useEffect, useState, useCallback } from 'react'
import { FlatList, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useFocusEffect } from 'expo-router'
import { api } from '../../../../lib/api'
import { Card } from '../../../../components/ui/Card'
import { Badge } from '../../../../components/ui/Badge'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { Ionicons } from '@expo/vector-icons'
import { DarkModeToggle } from '../../../../components/ui/DarkModeToggle'
import { LogoutButton } from '../../../../components/ui/LogoutButton'
import type { Transaction } from '@inventory/types'

type TransactionRow = Transaction & { date: string }

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTransactions = useCallback(() => {
    setIsLoading(true)
    api.get<TransactionRow[]>('/transactions')
      .then((res) => setTransactions(res.data ?? []))
      .finally(() => setIsLoading(false))
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchTransactions()
    }, [fetchTransactions])
  )

  if (isLoading && transactions.length === 0) return <LoadingSpinner />

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Header */}
      <View className="px-5 pt-14 pb-4 flex-row justify-between items-center">
        <Text className="text-text-primary dark:text-text-primary-dark text-[28px] font-[900]">Activity</Text>
        <View className="flex-row items-center">
          <DarkModeToggle />
          <LogoutButton />
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchTransactions} tintColor="#A78BFA" />}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text className="text-text-primary dark:text-text-primary-dark font-bold text-lg mt-4 text-center">No transactions yet</Text>
            <Text className="text-text-muted dark:text-text-muted text-sm mt-1 text-center font-medium">Stock movements will appear here</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 10) * 50).duration(400)}>
            <Card className="mb-3 p-3">
              <View className="flex-row items-center">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.type === 'IN' ? 'bg-success-light dark:bg-success-dark/20' : 'bg-danger-light dark:bg-danger-dark/20'}`}>
                  <Ionicons 
                    name={item.type === 'IN' ? "arrow-up" : "arrow-down"} 
                    size={24} 
                    color={item.type === 'IN' ? "#22C55E" : "#EF4444"} 
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="text-text-primary dark:text-text-primary-dark font-bold text-[16px]" numberOfLines={1}>{item.productName}</Text>
                  <Text className="text-text-muted dark:text-text-muted text-xs mt-1 font-medium">
                    {new Date(item.date).toLocaleDateString()} · By {item.performedBy}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className={`font-[800] text-[18px] ${item.type === 'IN' ? 'text-success' : 'text-danger'}`}>
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
          </Animated.View>
        )}
      />
    </View>
  )
}
