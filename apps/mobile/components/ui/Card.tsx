import { View, type ViewProps, StyleSheet, Platform } from 'react-native'

interface CardProps extends ViewProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className, style, ...props }: CardProps) {
  return (
    <View 
      className={`bg-card rounded-[16px] p-4 ${className || ''}`} 
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
})
