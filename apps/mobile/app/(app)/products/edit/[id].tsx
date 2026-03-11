import { useEffect, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProduct, useProducts } from '../../../../hooks/useProducts'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { BackButton } from '../../../../components/ui/BackButton'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be positive'),
  quantityInStock: z.coerce.number().int().min(0, 'Quantity must be 0 or more'),
  supplierName: z.string().min(1, 'Supplier name is required'),
})
type FormData = z.infer<typeof schema>

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { product, isLoading } = useProduct(id)
  const { updateProduct } = useProducts()
  const [serverError, setServerError] = useState<string | null>(null)

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description ?? '',
        category: product.category,
        price: Number(product.price),
        quantityInStock: product.quantityInStock,
        supplierName: product.supplierName,
      })
    }
  }, [product])

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await updateProduct(id, data)
      Alert.alert('Success', 'Product updated successfully')
      router.back()
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? err.message ?? 'Failed to update product')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Product',
          headerLeft: () => <BackButton />,
          headerRight: () => null 
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit Product</Text>

        {serverError ? <View style={styles.errorBox}><Text style={styles.errorText}>{serverError}</Text></View> : null}

        <Controller control={control} name="name" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Product Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
        )} />

        <Controller control={control} name="sku" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="SKU" autoCapitalize="characters" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.sku?.message} />
        )} />

        <Controller control={control} name="category" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Category" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.category?.message} />
        )} />

        <Controller control={control} name="price" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Price ($)" keyboardType="decimal-pad" value={value?.toString()} onChangeText={onChange} onBlur={onBlur} error={errors.price?.message} />
        )} />

        <Controller control={control} name="quantityInStock" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Stock Quantity" keyboardType="number-pad" value={value?.toString()} onChangeText={onChange} onBlur={onBlur} error={errors.quantityInStock?.message} />
        )} />

        <Controller control={control} name="supplierName" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Supplier" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.supplierName?.message} />
        )} />

        <Controller control={control} name="description" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Description (optional)" multiline numberOfLines={3} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} />
        )} />

        <Button title="Save Changes" loading={isSubmitting} onPress={handleSubmit(onSubmit)} style={styles.button} />
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} style={styles.cancelButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 60 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#111827', marginBottom: 24, letterSpacing: -0.5 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText: { color: '#b91c1c', fontSize: 14, fontFamily: 'Inter_500Medium' },
  button: { marginTop: 12 },
  cancelButton: { marginTop: 14 },
})
