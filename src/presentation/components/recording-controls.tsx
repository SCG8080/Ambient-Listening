import { View, Text, Pressable } from 'react-native'
import { Image } from 'expo-image'

interface RecordingControlsProps {
  isRecording: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

export function RecordingControls({
  isRecording,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}: RecordingControlsProps) {
  if (!isRecording) {
    return (
      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <Pressable
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1A3A5C',
            borderRadius: 14,
            paddingVertical: 18,
            gap: 10,
            borderWidth: 1,
            borderColor: '#2E6DB4',
          }}
          onPress={onStart}
        >
          <Image source="sf:mic.fill" style={{ width: 28, height: 28, tintColor: '#E8F4FF' }} />
          <Text style={{ color: '#E8F4FF', fontSize: 12, letterSpacing: 2, fontWeight: '600' }}>
            START RECORDING
          </Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A3A5C',
          borderRadius: 14,
          paddingVertical: 18,
          paddingHorizontal: 24,
          gap: 8,
          borderWidth: 1,
          borderColor: '#1E3A5A',
        }}
        onPress={onStop}
      >
        <Image source="sf:stop.fill" style={{ width: 22, height: 22, tintColor: '#A8C4E0' }} />
        <Text style={{ color: '#A8C4E0', fontSize: 12, letterSpacing: 2, fontWeight: '600' }}>
          STOP
        </Text>
      </Pressable>

      {isPaused ? (
        <Pressable
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1A3A5C',
            borderRadius: 14,
            paddingVertical: 18,
            gap: 10,
            borderWidth: 1,
            borderColor: '#2E6DB4',
          }}
          onPress={onResume}
        >
          <Image source="sf:play.fill" style={{ width: 28, height: 28, tintColor: '#E8F4FF' }} />
          <Text style={{ color: '#E8F4FF', fontSize: 12, letterSpacing: 2, fontWeight: '600' }}>
            RESUME
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4A9EFF',
            borderRadius: 14,
            paddingVertical: 18,
            gap: 10,
          }}
          onPress={onPause}
        >
          <Image source="sf:pause.fill" style={{ width: 28, height: 28, tintColor: '#0F1B2D' }} />
          <Text style={{ color: '#0F1B2D', fontSize: 12, letterSpacing: 2, fontWeight: '600' }}>
            PAUSE
          </Text>
        </Pressable>
      )}
    </View>
  )
}
