import { View, Text, Pressable } from 'react-native'
import { Image } from 'expo-image'
import { formatTime } from '@/utils/formatTime'

interface PlaybackControlsProps {
  isPlaying: boolean
  durationSeconds: number
  onPlay: () => void
  onPause: () => void
}

export function PlaybackControls({ isPlaying, durationSeconds, onPlay, onPause }: PlaybackControlsProps) {
  return (
    <View style={{ gap: 12, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Image source="sf:clock" style={{ width: 14, height: 14, tintColor: '#6B8BAA' }} />
        <Text style={{ color: '#A8C4E0', fontSize: 13, fontFamily: 'SpaceMono' }}>
          {formatTime(durationSeconds)}
        </Text>
      </View>
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#4A9EFF',
          borderRadius: 14, paddingVertical: 16, paddingHorizontal: 36, gap: 10 }}
        onPress={isPlaying ? onPause : onPlay}
      >
        <Image
          source={isPlaying ? 'sf:pause.fill' : 'sf:play.fill'}
          style={{ width: 26, height: 26, tintColor: '#0F1B2D' }}
        />
        <Text style={{ color: '#0F1B2D', fontSize: 13, letterSpacing: 2, fontWeight: '700' }}>
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </Text>
      </Pressable>
    </View>
  )
}
