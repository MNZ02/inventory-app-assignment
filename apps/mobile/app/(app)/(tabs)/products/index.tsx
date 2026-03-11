import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useRouter, useFocusEffect } from 'expo-router'
import { useProducts } from '../../../../hooks/useProducts'
import { Card } from '../../../../components/ui/Card'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { Badge } from '../../../../components/ui/Badge'
import { Ionicons } from '@expo/vector-icons'
import { DarkModeToggle } from '../../../../components/ui/DarkModeToggle'
import { LogoutButton } from '../../../../components/ui/LogoutButton'
import type { Product } from '@inventory/types'

const FILTERS = [
  { label: 'Total Stock', value: 'all' },
  { label: 'Out of Stock', value: 'out' },
  { label: 'Low Stock', value: 'low' },
]

export default function ProductsScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')

  const { products, isLoading, refetch } = useProducts({
    search: debouncedSearch || undefined,
  })

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    products.forEach(p => {
      const cat = p.category?.trim()
      if (cat) categories.add(cat)
    })
    const sorted = Array.from(categories).sort((a, b) => a.localeCompare(b))
    return ['all', ...sorted]
  }, [products])

  useEffect(() => {
    if (activeCategory !== 'all' && !categoryOptions.includes(activeCategory)) {
      setActiveCategory('all')
    }
  }, [categoryOptions, activeCategory])

  const filteredProducts = useMemo(() => {
    let result = products

    if (activeFilter === 'out') {
      result = result.filter(p => p.quantityInStock === 0)
    } else if (activeFilter === 'low') {
      result = result.filter(p => p.quantityInStock > 0 && p.quantityInStock < 10)
    }

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category?.trim() === activeCategory)
    }

    return result
  }, [products, activeFilter, activeCategory])

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const handleSearch = useCallback((text: string) => {
    setSearch(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(text)
      searchTimer.current = null
    }, 400)
  }, [])

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'danger' as const }
    if (quantity < 10) return { label: 'Low Stock', variant: 'warning' as const }
    return { label: 'In Stock', variant: 'success' as const }
  }

  if (isLoading && products.length === 0) return <LoadingSpinner />

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Header */}
      <View className="px-5 pt-14 pb-4 flex-row justify-between items-center">
        <Text className="text-text-primary dark:text-text-primary-dark text-[28px] font-[900]">Inventory</Text>
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="bg-primary-light dark:bg-primary-dark/20 px-4 py-2 rounded-full mr-2"
            onPress={() => router.push('/(app)/products/add')}
          >
            <Text className="text-primary dark:text-primary font-bold text-sm">Add Product</Text>
          </TouchableOpacity>
          <DarkModeToggle />
          <LogoutButton />
        </View>
      </View>

      {/* Filter Pills */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter.value}
              onPress={() => setActiveFilter(filter.value)}
              className={`mr-2 px-5 py-2.5 rounded-full ${
                activeFilter === filter.value 
                  ? 'bg-primary' 
                  : 'bg-card dark:bg-card-dark border border-border dark:border-border-dark'
              }`}
            >
              <Text className={`font-bold text-sm ${activeFilter === filter.value ? 'text-white' : 'text-text-secondary dark:text-text-muted'}`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Category Pills */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {categoryOptions.map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={`mr-2 px-5 py-2.5 rounded-full ${
                activeCategory === cat 
                  ? 'bg-primary' 
                  : 'bg-card dark:bg-card-dark border border-border dark:border-border-dark'
              }`}
            >
              <Text className={`font-bold text-sm ${activeCategory === cat ? 'text-white' : 'text-text-secondary dark:text-text-muted'}`}>
                {cat === 'all' ? 'All Categories' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-card dark:bg-card-dark rounded-[12px] px-4 py-3 border border-border dark:border-border-dark">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-text-primary dark:text-text-primary-dark text-[15px] py-1"
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#A78BFA" />}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
            <Text className="text-text-muted mt-4 font-medium text-lg text-center">No products found</Text>
          </View>
        }
        renderItem={({ item, index }: { item: Product; index: number }) => {
          const status = getStockStatus(item.quantityInStock);
          return (
            <Animated.View entering={FadeInDown.delay(Math.min(index, 10) * 50).duration(400)}>
              <TouchableOpacity onPress={() => router.push(`/(app)/products/${item.id}`)}>
                <Card className="mb-3 p-3 flex-row items-center">
                  <View className="w-[60px] h-[60px] bg-background dark:bg-background-dark rounded-[12px] items-center justify-center mr-4">
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} className="w-full h-full rounded-[12px]" />
                    ) : (
                      <Text className="text-primary font-bold text-lg">{item.name.slice(0, 2).toUpperCase()}</Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary dark:text-text-primary-dark font-[700] text-[15px]" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-text-muted dark:text-text-muted text-[12px] mt-0.5">SKU: {item.sku}</Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-text-primary dark:text-text-primary-dark font-bold text-sm mr-2">{item.quantityInStock} Units</Text>
                      {item.trend && (
                        <View className="flex-row items-center">
                          {item.trend.value !== 0 && (
                            <Ionicons 
                              name={item.trend.value > 0 ? "trending-up" : "trending-down"} 
                              size={12} 
                              color={item.trend.value > 0 ? "#22C55E" : "#EF4444"} 
                            />
                          )}
                          <Text 
                            className={`text-[10px] font-bold ml-0.5 ${
                              item.trend.value > 0 ? 'text-success' : item.trend.value < 0 ? 'text-danger' : 'text-text-muted'
                            }`}
                          >
                            {item.trend.value > 0 ? '+' : ''}{item.trend.value}{item.trend.kind === 'percent' ? '%' : 'u'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Badge label={status.label} variant={status.variant} />
                </Card>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
        style={{ elevation: 5, shadowColor: '#A78BFA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        onPress={() => router.push('/(app)/products/add')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  )
}
