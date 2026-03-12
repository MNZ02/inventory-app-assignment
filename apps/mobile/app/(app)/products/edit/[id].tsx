import { useEffect, useState, useRef } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View, TouchableOpacity, Image } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProduct, useProducts } from '../../../../hooks/useProducts'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import { Card } from '../../../../components/ui/Card'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { uploadProductImage } from '../../../../lib/api'
import { BarcodeScanner } from '../../../../components/ui/BarcodeScanner'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().nullable(),
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
  const [image, setImage] = useState<string | null>(null)
  const [isScannerVisible, setIsScannerVisible] = useState(false)
  const isInitialized = useRef(false)

  const { control, handleSubmit, reset, setValue, getValues, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (product && !isInitialized.current) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        description: product.description ?? '',
        category: product.category,
        price: Number(product.price),
        quantityInStock: product.quantityInStock,
        supplierName: product.supplierName,
      })
      if (product.imageUrl) setImage(product.imageUrl)
      isInitialized.current = true
    }
  }, [product, reset])

  const handleScanned = (scannedBarcode: string) => {
    setValue('barcode', scannedBarcode, { shouldValidate: true });
    // In edit mode, we typically don't auto-fill SKU if it already exists, 
    // as per chosen defaults (scanned value auto-fills SKU only when SKU is empty).
    const currentSku = getValues('sku');
    if (!currentSku || currentSku.trim() === '') {
      setValue('sku', scannedBarcode, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      let finalImageUrl = image || undefined;
      
      // If it's a new local file, upload it
      if (image && !image.startsWith('http')) {
        finalImageUrl = await uploadProductImage(image);
      }
      
      const payload: any = { 
        ...data, 
        barcode: data.barcode || null,
        imageUrl: finalImageUrl 
      };

      await updateProduct(id, payload)
      Alert.alert('Success', 'Product updated successfully')
      router.replace('/(app)/(tabs)/products')
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? err.message ?? 'Failed to update product')
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImage(result.assets[0].uri);
    }
  };

  const adjustStock = (amount: number) => {
    const current = getValues('quantityInStock') || 0;
    setValue('quantityInStock', Math.max(0, current + amount), { shouldValidate: true });
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <KeyboardAvoidingView className="flex-1 bg-white dark:bg-background-dark" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Custom Header */}
      <View className="px-5 pt-14 pb-4 flex-row justify-between items-center bg-white dark:bg-card-dark border-b border-border dark:border-border-dark">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-background dark:bg-background-dark items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#A78BFA" />
        </TouchableOpacity>
        <Text className="text-text-primary dark:text-text-primary-dark text-[17px] font-[700]">Edit Product</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {/* Image Section */}
        <Card className="mb-6 items-center py-8">
          {image ? (
            <TouchableOpacity onPress={pickImage} className="items-center">
              <Image source={{ uri: image }} className="w-24 h-24 rounded-[12px] mb-4" />
              <Text className="text-primary font-bold">Change Image</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View className="w-16 h-16 rounded-full bg-primary-light dark:bg-primary/20 items-center justify-center mb-4">
                <Ionicons name="image-outline" size={32} color="#A78BFA" />
              </View>
              <Text className="text-text-primary dark:text-text-primary-dark font-bold text-lg">No Product Image</Text>
              <Button 
                title="Add Image" 
                variant="primary" 
                size="sm" 
                fullWidth={false}
                onPress={pickImage}
                className="px-6 rounded-full mt-4"
              />
            </>
          )}
        </Card>

        {serverError ? (
          <View className="bg-danger-light dark:bg-danger-dark/20 p-4 rounded-xl mb-4">
            <Text className="text-danger dark:text-danger text-sm font-medium">{serverError}</Text>
          </View>
        ) : null}

        <Controller control={control} name="name" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Product Name" placeholder="Enter product name" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
        )} />

        <Controller control={control} name="barcode" render={({ field: { onChange, value, onBlur } }) => (
          <Input 
            label="Barcode (Optional)" 
            placeholder="Scan or enter barcode" 
            value={value ?? ''} 
            onChangeText={onChange} 
            onBlur={onBlur} 
            error={errors.barcode?.message}
            rightIcon={
              <TouchableOpacity onPress={() => setIsScannerVisible(true)} className="p-1">
                <Ionicons name="barcode-outline" size={24} color="#A78BFA" />
              </TouchableOpacity>
            }
          />
        )} />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller control={control} name="category" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Category" placeholder="e.g. Tools" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} error={errors.category?.message} />
            )} />
          </View>
          <View className="flex-1">
            <Controller control={control} name="sku" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="SKU" placeholder="WGT-001" autoCapitalize="characters" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} error={errors.sku?.message} />
            )} />
          </View>
        </View>

        {/* Quantity row */}
        <View className="mb-4">
          <Text
            className="mb-1.5 text-text-primary dark:text-text-primary-dark"
            style={{ fontWeight: '600', fontSize: 13 }}
          >
            Stock Quantity
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="min-w-[80px] px-4 h-12 bg-background dark:bg-card-dark border border-border dark:border-border-dark rounded-[12px] items-center justify-center">
              <Controller control={control} name="quantityInStock" render={({ field: { value } }) => (
                <Text className="text-text-primary dark:text-text-primary-dark font-bold text-lg">{value}</Text>
              )} />
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => adjustStock(1)}
                className="bg-success-light dark:bg-success-dark/20 px-4 py-2 rounded-full flex-row items-center"
              >
                <Ionicons name="add" size={16} color="#22C55E" />
                <Text className="text-success font-bold ml-1">Add</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => adjustStock(-1)}
                className="bg-danger-light dark:bg-danger-dark/20 px-4 py-2 rounded-full flex-row items-center"
              >
                <Ionicons name="remove" size={16} color="#EF4444" />
                <Text className="text-danger font-bold ml-1">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
          {errors.quantityInStock?.message && <Text className="text-sm text-danger dark:text-danger mt-1 font-medium">{errors.quantityInStock.message}</Text>}
        </View>

        <Controller control={control} name="supplierName" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Supplier Name" placeholder="Enter supplier" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.supplierName?.message} />
        )} />

        <Controller control={control} name="price" render={({ field: { onChange, value, onBlur } }) => (
          <Input 
            label="Selling Price" 
            placeholder="0.00" 
            keyboardType="decimal-pad" 
            value={value?.toString()} 
            onChangeText={onChange} 
            onBlur={onBlur} 
            error={errors.price?.message}
            leftIcon={<Text className="text-text-muted dark:text-text-muted font-bold">₹</Text>}
          />
        )} />

        <Controller control={control} name="description" render={({ field: { onChange, value, onBlur } }) => (
          <Input 
            label="Description" 
            placeholder="Product description" 
            multiline 
            className="h-20 text-start"
            textAlignVertical="top"
            value={value} 
            onChangeText={onChange} 
            onBlur={onBlur} 
            error={errors.description?.message} 
          />
        )} />

        <Button 
          title="Save Changes" 
          loading={isSubmitting} 
          onPress={handleSubmit(onSubmit)} 
          className="mt-4"
          disabled={!isValid}
        />
      </ScrollView>

      <BarcodeScanner 
        isVisible={isScannerVisible} 
        onClose={() => setIsScannerVisible(false)} 
        onScanned={handleScanned} 
      />
    </KeyboardAvoidingView>
  )
}
