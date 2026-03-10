import { StyleSheet, Text, View } from 'react-native'

interface BadgeProps {
  label: string
  variant?: 'success' | 'danger' | 'warning' | 'info'
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  success: { backgroundColor: '#dcfce7' },
  danger: { backgroundColor: '#fee2e2' },
  warning: { backgroundColor: '#fef9c3' },
  info: { backgroundColor: '#dbeafe' },
  text: { fontSize: 12, fontWeight: '600' },
  successText: { color: '#15803d' },
  dangerText: { color: '#b91c1c' },
  warningText: { color: '#854d0e' },
  infoText: { color: '#1d4ed8' },
})
