import { Pressable, View, Text } from 'react-native'
import { Image } from 'expo-image'
import type { Recording } from '@/domain/entities/Recording'
import { formatTime } from '@/utils/formatTime'
import { Badge } from './ui/badge'

const STATUS_CONFIG = {
  draft: { label: 'DRAFT', variant: 'default' as const },
  uploading: { label: 'UPLOADING', variant: 'outline' as const },
  uploaded: { label: 'UPLOADED', variant: 'success' as const },
  error: { label: 'ERROR', variant: 'error' as const },
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
      className="flex-row items-center justify-between bg-card rounded-2xl p-4 shadow-sm border border-border"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-background items-center justify-center">
          <Image source="sf:mic" style={{ width: 20, height: 20, tintColor: '#2563EB' }} />
        </View>
        <View className="gap-1">
          <Text className="text-clinical-text text-lg font-light font-mono">
            {formatTime(recording.durationSeconds)}
          </Text>
          <Text className="text-clinical-muted text-xs">{date}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2.5">
        {pauseCount > 0 && (
          <Text className="text-clinical-muted text-xs">
            {pauseCount} pause{pauseCount > 1 ? 's' : ''}
          </Text>
        )}
        <Badge label={status.label} variant={status.variant} />
        <Image source="sf:chevron.right" style={{ width: 16, height: 16, tintColor: '#94A3B8' }} />
      </View>
    </Pressable>
  )
}
