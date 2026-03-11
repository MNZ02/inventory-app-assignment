import React from 'react'
import { TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

interface BackButtonProps {
  color?: string
  onPress?: () => void
}

export const BackButton = ({ color = 'white', onPress }: BackButtonProps) => {
  const router = useRouter()

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.back()
    }
  }

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.container}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Back"
      accessibilityRole="button"
    >
      <Ionicons 
        name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'} 
        size={24} 
        color={color} 
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginLeft: Platform.OS === 'ios' ? 0 : 4,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
