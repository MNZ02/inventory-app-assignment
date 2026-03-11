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
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { useProducts } from '../../../../hooks/useProducts'
import { Card } from '../../../../components/ui/Card'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
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
          <Animated.View entering={FadeInDown.delay(index * 60).duration(350)}>
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
          </Animated.View>
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
  toolbar: { flexDirection: 'row', padding: 14, gap: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, fontFamily: 'Inter_400Regular', color: '#111827', backgroundColor: '#f8fafc' },
  sortBtn: { backgroundColor: '#eff6ff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center', borderWidth: 1, borderColor: '#dbeafe' },
  sortBtnText: { color: '#2563eb', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  list: { padding: 16, paddingBottom: 100 },
  empty: { textAlign: 'center', color: '#6b7280', padding: 40, fontFamily: 'Inter_400Regular', fontSize: 16 },
  card: { padding: 14, borderRadius: 16 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: '#111827', letterSpacing: -0.3 },
  cardSku: { fontSize: 13, fontFamily: 'Inter_500Medium', color: '#64748b', marginTop: 3 },
  cardCategory: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#3b82f6', marginTop: 3 },
  cardRight: { alignItems: 'flex-end' },
  cardPrice: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#0f172a' },
  cardStock: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#10b981', marginTop: 3 },
  lowStock: { color: '#ef4444' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabText: { color: '#fff', fontSize: 32, fontFamily: 'Inter_400Regular', lineHeight: 36 },
})
