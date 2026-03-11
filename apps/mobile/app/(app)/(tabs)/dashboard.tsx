import { useEffect, useState, useCallback } from 'react'
import { FlatList, ScrollView, StyleSheet, Text, View, RefreshControl, TouchableOpacity } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import type { Product, Transaction } from '@inventory/types'

interface DashboardData {
  totalProducts: number
  totalStockQuantity: number
  lowStockItems: Product[]
  recentTransactions: (Transaction & { date: string })[]
}

export default function DashboardScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get<DashboardData>('/dashboard')
      setData(res.data ?? null)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchData()
  }, [fetchData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  if (isLoading) return <LoadingSpinner />

  const lowStockCount = data?.lowStockItems.length ?? 0
  const hasLowStock = lowStockCount > 0

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.name}</Text>
        <Text style={styles.date}>{currentDate}</Text>
      </Animated.View>

      <View style={styles.statsRow}>
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={{ flex: 1 }}>
          <Card style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="cube-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>{data?.totalProducts ?? 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </Card>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ flex: 1 }}>
          <Card style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="layers-outline" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>{data?.totalStockQuantity ?? 0}</Text>
            <Text style={styles.statLabel}>Total Stock</Text>
          </Card>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={{ flex: 1 }}>
          <Card style={[styles.statCard, hasLowStock ? styles.statCardWarn : null]}>
            <View style={[styles.iconContainer, { backgroundColor: hasLowStock ? '#ffedd5' : '#fff7ed' }]}>
              <Ionicons name="warning-outline" size={24} color="#ea580c" />
            </View>
            <Text style={[styles.statValue, hasLowStock ? styles.statValueWarn : null]}>
              {lowStockCount}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </Card>
        </Animated.View>
      </View>

      {hasLowStock && (
        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <View style={styles.alertSection}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>⚠ Low Stock Alert — {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} need attention</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alertScroll}>
              {data?.lowStockItems.map(item => (
                <TouchableOpacity key={item.id} onPress={() => router.push(`/(app)/products/${item.id}`)}>
                  <Card style={styles.alertCard}>
                    <Text style={styles.alertItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.alertItemStock}>{item.quantityInStock} in stock</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.actionRow}>
        <Button 
          title="+ Add Product" 
          variant="primary" 
          style={styles.actionButton} 
          onPress={() => router.push('/(app)/products/add')} 
        />
        <Button 
          title="Transactions →" 
          variant="secondary" 
          style={styles.actionButton} 
          onPress={() => router.push('/(app)/(tabs)/transactions')} 
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(480).duration(400)}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/transactions')}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      {data?.recentTransactions.length === 0 ? (
        <Text style={styles.empty}>No transactions yet</Text>
      ) : (
        <FlatList
          data={data?.recentTransactions}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card style={styles.txItem}>
              <View style={styles.txRow}>
                <View style={styles.txInfo}>
                  <Text style={styles.txProduct}>{item.productName}</Text>
                  <Text style={styles.txMeta}>{new Date(item.date).toLocaleString()} · {item.performedBy}</Text>
                </View>
                <View style={styles.txRight}>
                  <Badge label={item.type} variant={item.type === 'IN' ? 'success' : 'danger'} />
                  <Text style={[styles.txQty, { color: item.type === 'IN' ? '#16a34a' : '#dc2626' }]}>
                    {item.type === 'IN' ? '+' : '-'}{item.quantityChange}
                  </Text>
                </View>
              </View>
            </Card>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  header: { marginBottom: 28 },
  greeting: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#111827', letterSpacing: -0.5 },
  date: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#6b7280', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 20 },
  statCardWarn: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa' },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#111827' },
  statValueWarn: { color: '#c2410c' },
  statLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#6b7280', marginTop: 4 },
  alertSection: { marginBottom: 28, backgroundColor: '#fff7ed', borderRadius: 16, borderWidth: 1, borderColor: '#fed7aa', overflow: 'hidden' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffedd5', padding: 14, borderBottomWidth: 1, borderBottomColor: '#fed7aa' },
  alertTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#ea580c' },
  alertScroll: { padding: 14, gap: 12 },
  alertCard: { padding: 14, width: 140, marginRight: 12, backgroundColor: '#fff', borderRadius: 12 },
  alertItemName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#111827', marginBottom: 4 },
  alertItemStock: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#dc2626' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  actionButton: { flex: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#111827', letterSpacing: -0.3 },
  viewAllText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#2563eb' },
  empty: { color: '#6b7280', textAlign: 'center', padding: 40, fontFamily: 'Inter_400Regular', fontSize: 15 },
  txItem: { padding: 14, borderRadius: 16 },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  txInfo: { flex: 1 },
  txProduct: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#111827' },
  txMeta: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#6b7280', marginTop: 3 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txQty: { fontSize: 18, fontFamily: 'Inter_700Bold' },
})
