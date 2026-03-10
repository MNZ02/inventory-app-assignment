import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ title, loading, variant = 'primary', style, disabled, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled || loading ? styles.disabled : null, style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#2563eb' : '#fff'} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' ? styles.textSecondary : null]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#2563eb' },
  danger: { backgroundColor: '#dc2626' },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontWeight: '600', fontSize: 16 },
  textSecondary: { color: '#2563eb' },
})
