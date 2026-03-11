import { Text, View } from 'react-native'

interface BadgeProps {
  label: string
  variant?: 'success' | 'danger' | 'warning' | 'info'
  className?: string
}

export function Badge({ label, variant = 'info', className }: BadgeProps) {
  const baseClasses = "rounded-full px-2.5 py-0.5 self-start";
  
  const variants = {
    success: { bg: "bg-green-100", text: "text-green-700" },
    danger: { bg: "bg-red-100", text: "text-red-700" },
    warning: { bg: "bg-yellow-100", text: "text-yellow-800" },
    info: { bg: "bg-blue-100", text: "text-blue-700" }
  };
  
  return (
    <View className={`${baseClasses} ${variants[variant].bg} ${className || ''}`}>
      <Text className={`text-xs font-semibold ${variants[variant].text}`}>{label}</Text>
    </View>
  )
}
