import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, TouchableOpacity } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Link } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Ionicons } from '@expo/vector-icons'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
type FormData = z.infer<typeof schema>

export default function RegisterScreen() {
  const { register } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await register(data.name, data.email, data.password)
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? err.message ?? 'Registration failed')
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white dark:bg-background-dark" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInUp.duration(600).springify()}>
          <Text className="text-[40px] font-[900] text-text-primary dark:text-text-primary-dark leading-[40px]">CREATE</Text>
          <Text className="text-[40px] font-[900] text-text-primary dark:text-text-primary-dark leading-[40px]">ACCOUNT</Text>
          <Text className="text-[40px] font-[900] text-primary leading-[40px]">INVENTORY</Text>
          
          <Text className="text-text-secondary dark:text-text-muted mt-3 text-[15px] font-[400] leading-6 mb-6">
            Join thousands managing their inventory smarter.
          </Text>
        </Animated.View>

        {serverError ? (
          <Animated.View entering={FadeInDown} className="bg-danger-light dark:bg-danger-dark/20 p-4 rounded-xl mb-4">
            <Text className="text-danger dark:text-danger text-sm font-medium">{serverError}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(100)}>
          <Controller control={control} name="name" render={({ field: { onChange, value, onBlur } }) => (
            <Input placeholder="Full Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
          )} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Controller control={control} name="email" render={({ field: { onChange, value, onBlur } }) => (
            <Input placeholder="Email Address" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
          )} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Controller control={control} name="password" render={({ field: { onChange, value, onBlur } }) => (
            <Input 
              placeholder="Password" 
              secureTextEntry={!showPassword} 
              value={value} 
              onChangeText={onChange} 
              onBlur={onBlur} 
              error={errors.password?.message}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
              }
            />
          )} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, value, onBlur } }) => (
            <Input placeholder="Confirm Password" secureTextEntry={!showPassword} value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} />
          )} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <Button title="Register" loading={isSubmitting} onPress={handleSubmit(onSubmit)} className="mt-4" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600)} className="flex-row justify-center mt-8">
          <Text className="text-text-secondary dark:text-text-muted font-[400] text-base">Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="text-primary font-bold text-base">Login</Text>
          </Link>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
