import { Pressable, View, Text } from 'react-native'
import { Image } from 'expo-image'
import type { Recording } from '@/domain/entities/Recording'
import { formatTime } from '@/utils/formatTime'

const STATUS_CONFIG = {
  draft: { label: 'DRAFT', color: '#6B8BAA', bg: '#1A3A5C' },
  uploading: { label: 'UPLOADING', color: '#4A9EFF', bg: '#1A3A5C' },
  uploaded: { label: 'UPLOADED', color: '#34D399', bg: '#0D3320' },
  error: { label: 'ERROR', color: '#F87171', bg: '#3B0D0D' },
}

interface RecordingListItemProps {
  recording: Recording
  onPress: () => void
}

export function RecordingListItem({ recording, onPress }: RecordingListItemProps) {
  const status = STATUS_CONFIG[recording.uploadStatus]
  const pauseCount = recording.pauseEvents.filter((e) => e.type === 'pause').length
  const date = new Date(recording.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <Pressable
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#1A3A5C', borderRadius: 12, padding: 16, marginBottom: 10 }}
      onPress={onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F1B2D',
          alignItems: 'center', justifyContent: 'center' }}>
          <Image source="sf:mic" style={{ width: 20, height: 20, tintColor: '#4A9EFF' }} />
        </View>
        <View style={{ gap: 2 }}>
          <Text style={{ color: '#E8F4FF', fontSize: 18, fontWeight: '300', fontFamily: 'SpaceMono' }}>
            {formatTime(recording.durationSeconds)}
          </Text>
          <Text style={{ color: '#6B8BAA', fontSize: 11 }}>{date}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {pauseCount > 0 && (
          <Text style={{ color: '#6B8BAA', fontSize: 11 }}>
            {pauseCount} pause{pauseCount > 1 ? 's' : ''}
          </Text>
        )}
        <View style={{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: status.bg }}>
          <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: status.color }}>
            {status.label}
          </Text>
        </View>
        <Image source="sf:chevron.right" style={{ width: 16, height: 16, tintColor: '#6B8BAA' }} />
      </View>
    </Pressable>
  )
}
