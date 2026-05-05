import { Text, View } from 'react-native'
import { formatTime } from '@/utils/formatTime'

interface Props {
  seconds: number
  isRecording: boolean
  isPaused: boolean
}

export function RecordingTimer({ seconds, isRecording, isPaused }: Props) {
  const label = !isRecording ? 'READY' : isPaused ? 'PAUSED' : 'RECORDING'
  const labelColor = !isRecording ? '#6B8BAA' : isPaused ? '#2E6DB4' : '#4A9EFF'

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Text
        style={{
          color: labelColor,
          fontSize: 11,
          letterSpacing: 3,
          fontFamily: 'SpaceMono',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: '#E8F4FF',
          fontSize: 56,
          fontWeight: '200',
          letterSpacing: 4,
          fontFamily: 'SpaceMono',
        }}
      >
        {formatTime(seconds)}
      </Text>
    </View>
  )
}
