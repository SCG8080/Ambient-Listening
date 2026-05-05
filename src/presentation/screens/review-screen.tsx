import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { usePlayback } from '@/hooks/use-playback'
import { uploadRecording } from '@/domain/usecases/uploadRecording'
import { recordingRepository, uploadService } from '@/data/repositories/recording-repository-instance'
import { PlaybackControls } from '@/presentation/components/playback-controls'
import { PauseTimeline } from '@/presentation/components/pause-timeline'
import { formatTime } from '@/utils/formatTime'

export function ReviewScreen() {
  const { recording, isPlaying, play, pause } = usePlayback()

  if (!recording) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F1B2D', alignItems: 'center',
        justifyContent: 'center', gap: 12 }}>
        <Image source="sf:headphones" style={{ width: 56, height: 56, tintColor: '#2E6DB4' }} />
        <Text style={{ color: '#A8C4E0', fontSize: 18, fontWeight: '300' }}>No recording to review</Text>
        <Text style={{ color: '#6B8BAA', fontSize: 13 }}>Stop a recording to review it here</Text>
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
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: '#0F1B2D' }}
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: '#E8F4FF', fontSize: 28, fontWeight: '300', letterSpacing: 1, marginBottom: 4 }}>
        Review
      </Text>

      {/* Session card */}
      <View style={{ backgroundColor: '#1A3A5C', borderRadius: 14, padding: 20, gap: 12,
        borderWidth: 1, borderColor: '#2E5A8A' }}>
        <Text style={{ color: '#6B8BAA', fontSize: 11, letterSpacing: 2 }}>SESSION</Text>
        <Text style={{ color: '#E8F4FF', fontSize: 20, fontWeight: '300' }}>
          {recording.session.patientName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: '#A8C4E0', fontSize: 13 }}>Team {recording.session.teamCode}</Text>
          <Text style={{ color: '#6B8BAA', fontSize: 13 }}>·</Text>
          <Text style={{ color: '#A8C4E0', fontSize: 13 }}>Program {recording.session.programCode}</Text>
          <Text style={{ color: '#6B8BAA', fontSize: 13 }}>·</Text>
          <Text style={{ color: '#A8C4E0', fontSize: 13 }}>{formatTime(recording.durationSeconds)}</Text>
        </View>
      </View>

      {/* Playback card */}
      <View style={{ backgroundColor: '#1A3A5C', borderRadius: 14, padding: 20, gap: 12,
        borderWidth: 1, borderColor: '#2E5A8A' }}>
        <Text style={{ color: '#6B8BAA', fontSize: 11, letterSpacing: 2 }}>PLAYBACK</Text>
        <PlaybackControls
          isPlaying={isPlaying}
          durationSeconds={recording.durationSeconds}
          onPlay={play}
          onPause={pause}
        />
      </View>

      {/* Timeline card (only if pause events exist) */}
      {recording.pauseEvents.length > 0 && (
        <View style={{ backgroundColor: '#1A3A5C', borderRadius: 14, padding: 20,
          borderWidth: 1, borderColor: '#2E5A8A' }}>
          <PauseTimeline
            pauseEvents={recording.pauseEvents}
            durationSeconds={recording.durationSeconds}
          />
        </View>
      )}

      {/* Upload button */}
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
          backgroundColor: isDone ? '#34D399' : '#4A9EFF',
          borderRadius: 14, paddingVertical: 18, gap: 10, marginTop: 8 }}
        onPress={handleUpload}
        disabled={isUploading || isDone}
      >
        {isUploading ? (
          <ActivityIndicator color="#0F1B2D" size="small" />
        ) : (
          <Image
            source={isDone ? 'sf:checkmark.circle.fill' : 'sf:icloud.and.arrow.up'}
            style={{ width: 20, height: 20, tintColor: '#0F1B2D' }}
          />
        )}
        <Text style={{ color: '#0F1B2D', fontSize: 13, letterSpacing: 2, fontWeight: '700' }}>
          {uploadLabel}
        </Text>
      </Pressable>
    </ScrollView>
  )
}
