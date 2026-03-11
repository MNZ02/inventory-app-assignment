import { Text, View } from 'react-native'

interface BadgeProps {
  label: string
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default'
  className?: string
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  const baseClasses = "rounded-full px-3 py-1 self-start";
  
  const variants = {
    success: { bg: "bg-success-light", text: "text-success" },
    danger: { bg: "bg-danger-light", text: "text-danger" },
    warning: { bg: "bg-warning-light", text: "text-warning" },
    info: { bg: "bg-primary-light", text: "text-primary" },
    default: { bg: "bg-background", text: "text-text-secondary" }
  };
  
  return (
    <View className={`${baseClasses} ${variants[variant].bg} ${className || ''}`}>
      <Text className={`text-[11px] font-bold uppercase tracking-wider ${variants[variant].text}`}>{label}</Text>
    </View>
  )
}
