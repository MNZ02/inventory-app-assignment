import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { api } from '../../../lib/api'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import type { Transaction } from '@inventory/types'

type TransactionRow = Transaction & { date: string }

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTransactions = () => {
    setIsLoading(true)
    api.get<TransactionRow[]>('/transactions')
      .then((res) => setTransactions(res.data ?? []))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  if (isLoading && transactions.length === 0) return <LoadingSpinner />

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={transactions}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchTransactions} />}
      ListEmptyComponent={<Text style={styles.empty}>No transactions found</Text>}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.productName}>{item.productName}</Text>
              <Text style={styles.meta}>By {item.performedBy}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
            </View>
            <View style={styles.right}>
              <Badge label={item.type} variant={item.type === 'IN' ? 'success' : 'danger'} />
              <Text style={[styles.qty, item.type === 'IN' ? styles.qtyIn : styles.qtyOut]}>
                {item.type === 'IN' ? '+' : '-'}{item.quantityChange}
              </Text>
            </View>
          </View>
        </Card>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 12 },
  empty: { textAlign: 'center', color: '#6b7280', padding: 32 },
  card: { padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  qty: { fontSize: 20, fontWeight: '700' },
  qtyIn: { color: '#16a34a' },
  qtyOut: { color: '#dc2626' },
})
