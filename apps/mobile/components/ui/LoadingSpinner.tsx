import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, Text, useColorScheme, View } from 'react-native'

export function LoadingSpinner() {
  const isDark = useColorScheme() === 'dark'
  const spin = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(1)).current
  const dot1 = useRef(new Animated.Value(0.35)).current
  const dot2 = useRef(new Animated.Value(0.35)).current
  const dot3 = useRef(new Animated.Value(0.35)).current

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    )

    const animateDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.35,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )

    const dots = [animateDot(dot1, 0), animateDot(dot2, 140), animateDot(dot3, 280)]

    spinLoop.start()
    pulseLoop.start()
    dots.forEach((d) => d.start())

    return () => {
      spinLoop.stop()
      pulseLoop.stop()
      dots.forEach((d) => d.stop())
      spin.stopAnimation()
      pulse.stopAnimation()
      dot1.stopAnimation()
      dot2.stopAnimation()
      dot3.stopAnimation()
    }
  }, [dot1, dot2, dot3, pulse, spin])

  const spinStyle = {
    transform: [
      {
        rotate: spin.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  }

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.aura, isDark ? styles.auraDark : styles.auraLight]} />

      <View style={styles.loaderShell}>
        <Animated.View style={[styles.outerRing, spinStyle, isDark ? styles.outerRingDark : styles.outerRingLight]} />
        <Animated.View style={[styles.innerCore, { transform: [{ scale: pulse }] }, isDark ? styles.innerCoreDark : styles.innerCoreLight]} />
      </View>

      <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>Syncing inventory</Text>

      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, isDark ? styles.dotDark : styles.dotLight, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, isDark ? styles.dotDark : styles.dotLight, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, isDark ? styles.dotDark : styles.dotLight, { opacity: dot3 }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  containerLight: { backgroundColor: '#F5F5F7' },
  containerDark: { backgroundColor: '#111111' },
  aura: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  auraLight: { backgroundColor: 'rgba(167, 139, 250, 0.12)' },
  auraDark: { backgroundColor: 'rgba(167, 139, 250, 0.2)' },
  loaderShell: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderStyle: 'dashed',
  },
  outerRingLight: {
    borderColor: 'rgba(124, 58, 237, 0.55)',
  },
  outerRingDark: {
    borderColor: 'rgba(167, 139, 250, 0.7)',
  },
  innerCore: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  innerCoreLight: { backgroundColor: '#A78BFA' },
  innerCoreDark: { backgroundColor: '#C4B5FD' },
  label: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelLight: { color: '#111111' },
  labelDark: { color: '#F9FAFB' },
  dotsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotLight: { backgroundColor: '#7C3AED' },
  dotDark: { backgroundColor: '#C4B5FD' },
})
