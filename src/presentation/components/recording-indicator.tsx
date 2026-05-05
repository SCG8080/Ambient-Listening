import { useEffect, useRef } from 'react'
import { View, Animated } from 'react-native'

interface Props {
  isRecording: boolean
  isPaused: boolean
}

const BAR_COUNT = 11

export function RecordingIndicator({ isRecording, isPaused }: Props) {
  const barAnims = useRef(
    Array.from({ length: BAR_COUNT }, (_, i) => new Animated.Value(i % 2 === 0 ? 0.5 : 0.3))
  ).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const ringOpacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = []

    if (isRecording && !isPaused) {
      const loopAnims = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 280 + i * 35,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 0.15,
              duration: 280 + i * 35,
              useNativeDriver: false,
            }),
          ])
        )
      )
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 850, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 850, useNativeDriver: true }),
        ])
      )
      const ringIn = Animated.timing(ringOpacityAnim, { toValue: 0.25, duration: 300, useNativeDriver: true })

      animations.push(...loopAnims, pulse, ringIn)
    } else {
      const barFreezes = barAnims.map((anim) =>
        Animated.timing(anim, { toValue: 0.35, duration: 250, useNativeDriver: false })
      )
      const pulseReset = Animated.timing(pulseAnim, { toValue: 1.0, duration: 250, useNativeDriver: true })
      const ringOut = Animated.timing(ringOpacityAnim, { toValue: 0, duration: 250, useNativeDriver: true })

      animations.push(...barFreezes, pulseReset, ringOut)
    }

    animations.forEach((a) => a.start())

    return () => animations.forEach((a) => a.stop())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // barAnims, pulseAnim, ringOpacityAnim are stable Animated.Value refs — intentionally omitted
  }, [isRecording, isPaused])

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: '#4A9EFF',
          transform: [{ scale: pulseAnim }],
          opacity: ringOpacityAnim,
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 44 }}>
        {barAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={{
              width: 3,
              borderRadius: 2,
              height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 36] }),
              backgroundColor: isPaused ? '#2E6DB4' : '#4A9EFF',
            }}
          />
        ))}
      </View>
    </View>
  )
}
