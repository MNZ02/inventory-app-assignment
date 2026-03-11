import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { api } from '../../../../lib/api'
import { Card } from '../../../../components/ui/Card'
import { Badge } from '../../../../components/ui/Badge'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
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
  content: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#6b7280', padding: 40, fontFamily: 'Inter_400Regular', fontSize: 16 },
  card: { padding: 16, borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1 },
  productName: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: '#111827', letterSpacing: -0.3 },
  meta: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#6b7280', marginTop: 3 },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#9ca3af', marginTop: 3 },
  right: { alignItems: 'flex-end', gap: 6 },
  qty: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  qtyIn: { color: '#16a34a' },
  qtyOut: { color: '#dc2626' },
})
