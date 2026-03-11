import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProducts } from '../../../hooks/useProducts'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { BackButton } from '../../../components/ui/BackButton'

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

export default function AddProductScreen() {
  const router = useRouter()
  const { createProduct } = useProducts()
  const [serverError, setServerError] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantityInStock: 0 },
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await createProduct(data)
      Alert.alert('Success', 'Product created successfully')
      router.back()
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? err.message ?? 'Failed to create product')
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen 
        options={{ 
          title: 'Add Product',
          headerLeft: () => <BackButton />,
          headerRight: () => null 
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add Product</Text>

        {serverError ? <View style={styles.errorBox}><Text style={styles.errorText}>{serverError}</Text></View> : null}

        <Controller control={control} name="name" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Product Name" placeholder="e.g. Widget A" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
        )} />

        <Controller control={control} name="sku" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="SKU" placeholder="e.g. WGT-001" autoCapitalize="characters" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.sku?.message} />
        )} />

        <Controller control={control} name="category" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Category" placeholder="e.g. Electronics" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.category?.message} />
        )} />

        <Controller control={control} name="price" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Price ($)" placeholder="0.00" keyboardType="decimal-pad" value={value?.toString()} onChangeText={onChange} onBlur={onBlur} error={errors.price?.message} />
        )} />

        <Controller control={control} name="quantityInStock" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Initial Stock" placeholder="0" keyboardType="number-pad" value={value?.toString()} onChangeText={onChange} onBlur={onBlur} error={errors.quantityInStock?.message} />
        )} />

        <Controller control={control} name="supplierName" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Supplier" placeholder="Supplier name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.supplierName?.message} />
        )} />

        <Controller control={control} name="description" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Description (optional)" placeholder="Product description" multiline numberOfLines={3} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.description?.message} />
        )} />

        <Button title="Create Product" loading={isSubmitting} onPress={handleSubmit(onSubmit)} style={styles.button} />
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
