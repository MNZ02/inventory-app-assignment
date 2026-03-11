import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export function LoadingSpinner() {
  const spinValue = useRef(new Animated.Value(0)).current
  const pulseValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start()

    return () => {
      spinValue.stopAnimation()
      pulseValue.stopAnimation()
    }
  }, [spinValue, pulseValue])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const scale = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.15]
  })

  return (
    <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
      <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
        {/* Faded background track */}
        <View style={styles.ringTrack} />
        
        {/* Spinning arc */}
        <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]} />
        
        {/* Pulsing center icon */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="cube" size={24} color="#A78BFA" />
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  ringTrack: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3.5,
    borderColor: 'rgba(167, 139, 250, 0.2)', // Light primary track
  },
  ring: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3.5,
    borderColor: 'transparent',
    borderTopColor: '#A78BFA',
    borderRightColor: '#A78BFA',
  }
})
