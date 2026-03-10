import { useEffect, useState } from 'react'
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native'
import { api } from '../../lib/api'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import type { Product, Transaction } from '@inventory/types'

interface DashboardData {
  totalProducts: number
  totalStockQuantity: number
  lowStockItems: Product[]
  recentTransactions: (Transaction & { date: string })[]
}

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then((res) => {
      setData(res.data ?? null)
    }).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSpinner />

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Dashboard</Text>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{data?.totalProducts ?? 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{data?.totalStockQuantity ?? 0}</Text>
          <Text style={styles.statLabel}>Total Stock</Text>
        </Card>
        <Card style={[styles.statCard, (data?.lowStockItems.length ?? 0) > 0 ? styles.statCardWarn : null]}>
          <Text style={[styles.statValue, (data?.lowStockItems.length ?? 0) > 0 ? styles.statValueWarn : null]}>
            {data?.lowStockItems.length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
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
                  <Text style={styles.txMeta}>{new Date(item.date).toLocaleDateString()} · {item.performedBy}</Text>
                </View>
                <View style={styles.txRight}>
                  <Badge label={item.type} variant={item.type === 'IN' ? 'success' : 'danger'} />
                  <Text style={styles.txQty}>{item.type === 'IN' ? '+' : '-'}{item.quantityChange}</Text>
                </View>
              </View>
            </Card>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  heading: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center' },
  statCardWarn: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa' },
  statValue: { fontSize: 28, fontWeight: '700', color: '#111827' },
  statValueWarn: { color: '#c2410c' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  empty: { color: '#6b7280', textAlign: 'center', padding: 32 },
  txItem: { padding: 12 },
  txRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  txInfo: { flex: 1 },
  txProduct: { fontSize: 15, fontWeight: '600', color: '#111827' },
  txMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txQty: { fontSize: 16, fontWeight: '700', color: '#374151' },
})
