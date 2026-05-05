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
      loopAnims.forEach((a) => a.start())
      pulse.start()
      Animated.timing(ringOpacityAnim, { toValue: 0.25, duration: 300, useNativeDriver: true }).start()
      return () => {
        loopAnims.forEach((a) => a.stop())
        pulse.stop()
      }
    } else {
      barAnims.forEach((anim) =>
        Animated.timing(anim, { toValue: 0.35, duration: 250, useNativeDriver: false }).start()
      )
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 250, useNativeDriver: true }).start()
      Animated.timing(ringOpacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start()
    }
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
