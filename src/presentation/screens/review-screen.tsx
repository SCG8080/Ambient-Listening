import { View, Text, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePlayback } from '@/hooks/use-playback'
import { uploadRecording } from '@/domain/usecases/uploadRecording'
import { recordingRepository, uploadService } from '@/data/repositories/recording-repository-instance'
import { PlaybackControls } from '@/presentation/components/playback-controls'
import { PauseTimeline } from '@/presentation/components/pause-timeline'
import { formatTime } from '@/utils/formatTime'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'

export function ReviewScreen() {
  const insets = useSafeAreaInsets()
  const { recording, isPlaying, play, pause } = usePlayback()

  if (!recording) {
    return (
      <View className="flex-1 bg-background items-center justify-center gap-3">
        <Image source="sf:headphones" style={{ width: 56, height: 56, tintColor: '#CBD5E1' }} />
        <Text className="text-clinical-secondary text-lg font-light">No recording to review</Text>
        <Text className="text-clinical-muted text-sm">Stop a recording to review it here</Text>
      </View>
    )
  }

  const handleUpload = async () => {
    if (recording.uploadStatus === 'uploaded' || recording.uploadStatus === 'uploading') return
    try {
      await uploadRecording(uploadService, recordingRepository, recording.id)
    } catch {
      // status is set to 'error' by the use case
    }
  }

  const uploadLabel = {
    draft: 'UPLOAD RECORDING',
    uploading: 'UPLOADING...',
    uploaded: 'UPLOADED',
    error: 'RETRY UPLOAD',
  }[recording.uploadStatus]

  const isUploading = recording.uploadStatus === 'uploading'
  const isDone = recording.uploadStatus === 'uploaded'

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, gap: 16, paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-clinical-text text-3xl font-light tracking-wide mb-1">
        Review
      </Text>

      {/* Session card */}
      <Card className="gap-3">
        <Text className="text-clinical-muted text-xs tracking-widest">SESSION</Text>
        <Text className="text-clinical-text text-xl font-light">
          {recording.session.patientName}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-clinical-secondary text-sm">Team {recording.session.teamCode}</Text>
          <Text className="text-clinical-muted text-sm">·</Text>
          <Text className="text-clinical-secondary text-sm">Program {recording.session.programCode}</Text>
          <Text className="text-clinical-muted text-sm">·</Text>
          <Text className="text-clinical-secondary text-sm">{formatTime(recording.durationSeconds)}</Text>
        </View>
      </Card>

      {/* Playback card */}
      <Card className="gap-3">
        <Text className="text-clinical-muted text-xs tracking-widest">PLAYBACK</Text>
        <PlaybackControls
          isPlaying={isPlaying}
          durationSeconds={recording.durationSeconds}
          onPlay={play}
          onPause={pause}
        />
      </Card>

      {/* Timeline card (only if pause events exist) */}
      {recording.pauseEvents.length > 0 && (
        <Card>
          <PauseTimeline
            pauseEvents={recording.pauseEvents}
            durationSeconds={recording.durationSeconds}
          />
        </Card>
      )}

      {/* Upload button */}
      <Button
        label={uploadLabel as string}
        icon={isDone ? 'sf:checkmark.circle.fill' : 'sf:icloud.and.arrow.up'}
        variant={isDone ? 'success' : 'primary'}
        onPress={handleUpload}
        disabled={isUploading || isDone}
        className="mt-2 py-4"
      />
    </ScrollView>
  )
}
