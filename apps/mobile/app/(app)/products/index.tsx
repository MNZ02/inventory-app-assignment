import { useState, useCallback, useRef, useEffect } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useProducts } from '../../../hooks/useProducts'
import { Card } from '../../../components/ui/Card'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import type { Product } from '@inventory/types'

const SORT_OPTIONS = [
  { label: 'Default', sortBy: undefined, order: undefined },
  { label: 'Price ↑', sortBy: 'price' as const, order: 'asc' as const },
  { label: 'Price ↓', sortBy: 'price' as const, order: 'desc' as const },
  { label: 'Stock ↑', sortBy: 'quantity' as const, order: 'asc' as const },
  { label: 'Stock ↓', sortBy: 'quantity' as const, order: 'desc' as const },
]

export default function ProductsScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortIndex, setSortIndex] = useState(0)
  const sort = SORT_OPTIONS[sortIndex]

  const { products, isLoading, refetch } = useProducts({
    search: debouncedSearch || undefined,
    sortBy: sort.sortBy,
    order: sort.order,
  })

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  const handleSearch = useCallback((text: string) => {
    setSearch(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(text)
      searchTimer.current = null
    }, 400)
  }, [])

  const cycleSortIndex = () => setSortIndex((i) => (i + 1) % SORT_OPTIONS.length)

  if (isLoading && products.length === 0) return <LoadingSpinner />

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.sortBtn} onPress={cycleSortIndex}>
          <Text style={styles.sortBtnText}>{sort.label}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={<Text style={styles.empty}>No products found</Text>}
        renderItem={({ item, index }: { item: Product; index: number }) => (
          <View>
          <TouchableOpacity onPress={() => router.push(`/(app)/products/${item.id}`)}>
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardSku}>SKU: {item.sku}</Text>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardPrice}>${Number(item.price).toFixed(2)}</Text>
                  <Text style={[styles.cardStock, item.quantityInStock < 10 ? styles.lowStock : null]}>
                    {item.quantityInStock} in stock
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(app)/products/add')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  toolbar: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: '#111827', backgroundColor: '#f9fafb' },
  sortBtn: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center' },
  sortBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 13 },
  list: { padding: 12 },
  empty: { textAlign: 'center', color: '#6b7280', padding: 32 },
  card: {},
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardSku: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardCategory: { fontSize: 12, color: '#2563eb', marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardStock: { fontSize: 12, color: '#16a34a', marginTop: 2 },
  lowStock: { color: '#dc2626' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
})
