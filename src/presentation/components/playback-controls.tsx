import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { formatTime } from '@/utils/formatTime'
import { Button } from './ui/button'

interface PlaybackControlsProps {
  isPlaying: boolean
  durationSeconds: number
  onPlay: () => void
  onPause: () => void
}

export function PlaybackControls({ isPlaying, durationSeconds, onPlay, onPause }: PlaybackControlsProps) {
  return (
    <View className="gap-3 items-center">
      <View className="flex-row items-center gap-1.5">
        <Image source="sf:clock" style={{ width: 14, height: 14, tintColor: '#94A3B8' }} />
        <Text className="text-clinical-secondary text-sm font-mono">
          {formatTime(durationSeconds)}
        </Text>
      </View>
      <Button
        label={isPlaying ? 'PAUSE' : 'PLAY'}
        icon={isPlaying ? 'sf:pause.fill' : 'sf:play.fill'}
        onPress={isPlaying ? onPause : onPlay}
        className="px-10"
      />
    </View>
  )
}
