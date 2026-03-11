import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Link } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Ionicons } from '@expo/vector-icons'

const { height } = Dimensions.get('window');

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const { login } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await login(data.email, data.password)
    } catch (err: any) {
      setServerError(err?.response?.data?.error ?? err.message ?? 'Login failed')
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white dark:bg-background-dark" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ height: height * 0.55 }} className="px-5 justify-center">
          <Animated.View entering={FadeInUp.duration(600).springify()}>
            <Text className="text-[52px] font-[900] text-text-primary dark:text-text-primary-dark leading-[52px]">PRECISION</Text>
            <Text className="text-[52px] font-[900] text-primary leading-[52px]">INVENTORY</Text>
            <Text className="text-[52px] font-[900] text-text-primary dark:text-text-primary-dark leading-[52px]">FOR GROWING</Text>
            <Text className="text-[52px] font-[900] text-text-primary dark:text-text-primary-dark leading-[52px]">BUSINESSES</Text>
            
            <Text className="text-text-secondary dark:text-text-muted mt-4 text-[15px] font-[400] leading-6">
              Built to simplify complex workflows and give you complete visibility into your inventory.
            </Text>
          </Animated.View>
        </View>

        <View className="px-5 pb-10">
          {serverError ? (
            <Animated.View entering={FadeInDown} className="bg-danger-light dark:bg-danger-dark/20 p-4 rounded-xl mb-4">
              <Text className="text-danger dark:text-danger text-sm font-medium">{serverError}</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(100)}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  placeholder="Email Address"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#6B7280" 
                      />
                    </TouchableOpacity>
                  }
                />
              )}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <Button 
              title="Explore Inventory" 
              loading={isSubmitting} 
              onPress={handleSubmit(onSubmit)} 
              className="mt-2"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} className="flex-row justify-center mt-6">
            <Text className="text-text-secondary dark:text-text-muted font-[400] text-base">Don&apos;t have an account? </Text>
            <Link href="/(auth)/register">
              <Text className="text-primary font-bold text-base">Register</Text>
            </Link>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
