import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Link } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInUp.duration(500).springify()}>
          <Animated.Text entering={FadeInDown.delay(100).duration(400)} style={styles.title}>Create Account</Animated.Text>
          <Animated.Text entering={FadeInDown.delay(150).duration(400)} style={styles.subtitle}>Get started with Inventory</Animated.Text>

          {serverError ? <View style={styles.errorBox}><Text style={styles.errorText}>{serverError}</Text></View> : null}

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Controller control={control} name="name" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Full Name" placeholder="Jane Doe" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.name?.message} />
            )} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(260).duration(400)}>
            <Controller control={control} name="email" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
            )} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400)}>
            <Controller control={control} name="password" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Password" placeholder="Min. 8 characters" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
            )} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(380).duration(400)}>
            <Controller control={control} name="confirmPassword" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Confirm Password" placeholder="Repeat password" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} />
            )} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(440).duration(400)}>
            <Button title="Create Account" loading={isSubmitting} onPress={handleSubmit(onSubmit)} style={styles.button} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login"><Text style={styles.link}>Sign In</Text></Link>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f9fafb' },
  title: { fontSize: 32, fontFamily: 'Inter_700Bold', color: '#111827', marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 17, fontFamily: 'Inter_400Regular', color: '#6b7280', marginBottom: 36 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText: { color: '#b91c1c', fontSize: 14, fontFamily: 'Inter_500Medium' },
  button: { marginTop: 12 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { color: '#6b7280', fontFamily: 'Inter_400Regular', fontSize: 15 },
  link: { color: '#2563eb', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
})
