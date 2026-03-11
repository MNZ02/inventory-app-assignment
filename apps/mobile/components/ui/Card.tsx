import { View, type ViewProps } from 'react-native'

interface CardProps extends ViewProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View className={`bg-white rounded-2xl p-4 shadow-sm elevation-2 ${className || ''}`} {...props}>
      {children}
    </View>
  )
}
