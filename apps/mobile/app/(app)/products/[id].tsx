import { useState } from 'react'
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useProduct } from '../../../hooks/useProducts'
import { api } from '../../../lib/api'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { Ionicons } from '@expo/vector-icons'
import type { Transaction } from '@inventory/types'

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { product, isLoading, error, refetch } = useProduct(id)
  const [modalVisible, setModalVisible] = useState(false)
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN')
  const [quantity, setQuantity] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  const handleDelete = () => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/products/${id}`)
            router.back()
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error ?? 'Failed to delete product')
          }
        },
      },
    ])
  }

  const openAdjust = (type: 'IN' | 'OUT') => {
    setAdjustType(type)
    setQuantity('')
    setModalVisible(true)
  }

  const handleAdjust = async () => {
    const qty = parseInt(quantity, 10)
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Enter a valid quantity')
      return
    }
    setAdjusting(true)
    try {
      await api.post<Transaction>('/transactions', { productId: id, quantityChange: qty, type: adjustType })
      await refetch()
      setModalVisible(false)
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Transaction failed')
    } finally {
      setAdjusting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error || !product) return (
    <View className="flex-1 items-center justify-center p-6 bg-background dark:bg-background-dark">
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text className="text-danger dark:text-danger-dark font-medium text-center mt-3">{error ?? 'Product not found'}</Text>
      <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
    </View>
  )

  const stockPercentage = Math.min(100, (product.quantityInStock / 50) * 100);
  const stockColor = product.quantityInStock === 0 ? '#EF4444' : product.quantityInStock < 10 ? '#F59E0B' : '#22C55E';

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      {/* Header Overlay */}
      <View className="absolute top-14 left-5 z-10">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/20 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Product Image */}
        <View className="w-full h-[220px] bg-primary-light dark:bg-primary/10 items-center justify-center rounded-b-[24px] overflow-hidden">
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} className="w-full h-full" />
          ) : (
            <Ionicons name="cube-outline" size={80} color="#A78BFA" />
          )}
        </View>

        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-text-primary dark:text-text-primary-dark text-[24px] font-[800] leading-8">{product.name}</Text>
              <View className="flex-row items-center mt-2">
                <Badge label={`SKU: ${product.sku}`} variant="default" className="mr-2" />
                <Badge label={product.category} variant="info" />
              </View>
            </View>
            <Text className="text-primary dark:text-primary text-[22px] font-[700]">₹{Number(product.price).toFixed(2)}</Text>
          </View>

          {/* Stock Indicator */}
          <View className="mt-8 mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-primary dark:text-text-primary-dark font-bold">Stock Availability</Text>
              <Text className="text-text-primary dark:text-text-primary-dark font-bold">{product.quantityInStock} Units</Text>
            </View>
            <View className="h-2 w-full bg-border dark:bg-border-dark rounded-full overflow-hidden">
              <View 
                className="h-full rounded-full" 
                style={{ width: `${stockPercentage}%`, backgroundColor: stockColor }} 
              />
            </View>
            <Text className="text-text-muted dark:text-text-muted text-xs mt-2 font-medium">
              {product.quantityInStock === 0 ? 'Out of stock' : product.quantityInStock < 10 ? 'Low stock alert' : 'Healthy stock level'}
            </Text>
          </View>

          {/* Details Card */}
          <Card className="mb-6 p-0 overflow-hidden">
            <DetailRow label="Category" value={product.category} />
            <DetailRow label="Supplier" value={product.supplierName} />
            <DetailRow label="Created Date" value={new Date(product.createdAt).toLocaleDateString()} />
            {product.description && (
              <View className="p-4">
                <Text className="text-text-muted dark:text-text-muted text-[13px] font-semibold mb-1">Description</Text>
                <Text className="text-text-primary dark:text-text-primary-dark text-[15px] leading-5">{product.description}</Text>
              </View>
            )}
          </Card>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity 
              onPress={() => openAdjust('IN')}
              className="flex-1 bg-success-light dark:bg-success-dark/20 h-[52px] rounded-[14px] items-center justify-center flex-row"
            >
              <Ionicons name="arrow-up" size={18} color="#22C55E" />
              <Text className="text-success font-bold ml-2">Stock IN</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => openAdjust('OUT')}
              className="flex-1 bg-danger-light dark:bg-danger-dark/20 h-[52px] rounded-[14px] items-center justify-center flex-row"
            >
              <Ionicons name="arrow-down" size={18} color="#EF4444" />
              <Text className="text-danger font-bold ml-2">Stock OUT</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <Button 
              title="Edit Product" 
              variant="secondary" 
              className="flex-1" 
              onPress={() => router.push(`/(app)/products/edit/${id}`)} 
            />
            <Button 
              title="Delete" 
              variant="outlined" 
              className="flex-1" 
              style={{ borderColor: '#EF4444' }}
              onPress={handleDelete} 
            />
          </View>
        </View>
      </ScrollView>

      {/* Adjustment Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity 
          className="flex-1 bg-black/40 dark:bg-black/60 justify-end" 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} className="bg-white dark:bg-card-dark rounded-t-[24px] p-6 pb-10">
            <View className="w-12 h-1 bg-border dark:bg-border-dark self-center rounded-full mb-6" />
            <Text className="text-text-primary dark:text-text-primary-dark text-[20px] font-[800] mb-6">
              {adjustType === 'IN' ? 'Restock Product' : 'Stock Outflow'}
            </Text>
            
            <View className="bg-background dark:bg-background-dark rounded-[16px] p-6 mb-8 items-center border border-border dark:border-border-dark">
              <Text className="text-text-muted dark:text-text-muted text-xs font-bold uppercase tracking-widest mb-2">Quantity to Adjust</Text>
              <TextInput
                className="text-[40px] font-[800] text-text-primary dark:text-text-primary-dark w-full text-center"
                placeholder="0"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                value={quantity}
                onChangeText={setQuantity}
                autoFocus
              />
            </View>

            <View className="flex-row gap-3">
              <Button 
                title="Cancel" 
                variant="secondary" 
                className="flex-1" 
                onPress={() => setModalVisible(false)} 
              />
              <Button 
                title="Confirm" 
                loading={adjusting} 
                className="flex-1" 
                onPress={handleAdjust} 
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center p-4 border-b border-border dark:border-border-dark">
      <Text className="text-text-muted dark:text-text-muted text-[13px] font-semibold">{label}</Text>
      <Text className="text-text-primary dark:text-text-primary-dark text-[15px] font-bold">{value}</Text>
    </View>
  )
}
