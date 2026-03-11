import { useState } from 'react'
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useProduct } from '../../../hooks/useProducts'
import { api } from '../../../lib/api'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { BackButton } from '../../../components/ui/BackButton'
import type { Transaction } from '@inventory/types'

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
  if (error || !product) return <View style={styles.center}><Text style={styles.errorText}>{error ?? 'Product not found'}</Text></View>

  const isLowStock = product.quantityInStock < 10

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen 
        options={{ 
          title: 'Product Details',
          headerLeft: () => <BackButton />,
          headerRight: () => null 
        }} 
      />
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.sku}>SKU: {product.sku}</Text>
        </View>
        <Badge label={product.category} variant="info" />
      </View>

      <Card style={styles.stockCard}>
        <Text style={styles.stockLabel}>Current Stock</Text>
        <Text style={[styles.stockValue, isLowStock ? styles.stockLow : styles.stockOk]}>
          {product.quantityInStock} units
        </Text>
        {isLowStock && <Text style={styles.lowStockWarning}>⚠ Low stock</Text>}
      </Card>

      <Card style={styles.detailCard}>
        <Row label="Price" value={`$${Number(product.price).toFixed(2)}`} />
        <Row label="Supplier" value={product.supplierName} />
        {product.description ? <Row label="Description" value={product.description} /> : null}
        <Row label="Created" value={new Date(product.createdAt).toLocaleDateString()} />
      </Card>

      <View style={styles.actionRow}>
        <Button title="Stock In" variant="primary" style={styles.actionBtn} onPress={() => openAdjust('IN')} />
        <Button title="Stock Out" variant="danger" style={styles.actionBtn} onPress={() => openAdjust('OUT')} />
      </View>

      <View style={styles.actionRow}>
        <Button title="Edit" variant="secondary" style={styles.actionBtn} onPress={() => router.push(`/(app)/products/edit/${id}`)} />
        <Button title="Delete" variant="danger" style={styles.actionBtn} onPress={handleDelete} />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{adjustType === 'IN' ? 'Add Stock' : 'Remove Stock'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter quantity"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
              autoFocus
            />
            <View style={styles.actionRow}>
              <Button title="Cancel" variant="secondary" style={styles.actionBtn} onPress={() => setModalVisible(false)} />
              <Button title="Confirm" loading={adjusting} style={styles.actionBtn} onPress={handleAdjust} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  )
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  label: { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#6b7280' },
  value: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#111827', flex: 1, textAlign: 'right' },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#dc2626', fontFamily: 'Inter_500Medium', fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  name: { fontSize: 26, fontFamily: 'Inter_700Bold', color: '#111827', letterSpacing: -0.5 },
  sku: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#6b7280', marginTop: 4 },
  stockCard: { marginBottom: 16, alignItems: 'center', paddingVertical: 24, borderRadius: 20 },
  stockLabel: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#6b7280' },
  stockValue: { fontSize: 40, fontFamily: 'Inter_700Bold', marginTop: 8 },
  stockOk: { color: '#16a34a' },
  stockLow: { color: '#dc2626' },
  lowStockWarning: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#ea580c', marginTop: 6 },
  detailCard: { marginBottom: 20, borderRadius: 20, padding: 16 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionBtn: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#111827', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontFamily: 'Inter_600SemiBold', color: '#111827', marginBottom: 20, textAlign: 'center' },
})
