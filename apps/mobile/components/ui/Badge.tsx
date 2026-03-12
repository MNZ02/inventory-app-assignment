import { Text, View } from 'react-native'

interface BadgeProps {
  label: string
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default'
  className?: string
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  const baseClasses = "rounded-full px-[10px] py-[4px] self-start";
  
  const variants = {
    success: { bg: "bg-success-light dark:bg-success-dark/20", text: "text-success dark:text-success" },
    danger: { bg: "bg-danger-light dark:bg-danger-dark/20", text: "text-danger dark:text-danger" },
    warning: { bg: "bg-warning-light dark:bg-warning-dark/20", text: "text-warning dark:text-warning" },
    info: { bg: "bg-primary-light dark:bg-primary/20", text: "text-primary dark:text-primary" },
    default: { bg: "bg-background dark:bg-border-dark", text: "text-text-secondary dark:text-text-muted" }
  };
  
  return (
    <View className={`${baseClasses} ${variants[variant].bg} ${className || ''}`}>
      <Text className={`text-[11px] font-bold uppercase tracking-wider ${variants[variant].text}`}>{label}</Text>
    </View>
  )
}
