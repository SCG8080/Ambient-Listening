import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { setAudioModeAsync } from 'expo-audio'
import { useRecorder } from '@/hooks/use-recorder'
import { useAppState } from '@/hooks/use-app-state'
import { useSessionStore } from '@/store/session-store'
import { RecordingIndicator } from '@/presentation/components/recording-indicator'
import { RecordingTimer } from '@/presentation/components/recording-timer'
import { RecordingControls } from '@/presentation/components/recording-controls'
import { Badge } from '../components/ui/badge'

export function RecordingScreen() {
  const insets = useSafeAreaInsets()
  const { isRecording, isPaused, elapsedSeconds, start, pause, resume, stop } = useRecorder()
  const session = useSessionStore((s) => s.context)

  useAppState(
    () => {
      if (isRecording && !isPaused) pause()
    },
    () => {
      // Re-establish audio session on foreground return, before the user taps RESUME
      if (isRecording) {
        setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
      }
    },
  )

  return (
    <View 
      className="flex-1 bg-background px-6 justify-between pb-8"
    >
      {/* Session header */}
      <View style={{ paddingTop: insets.top + 12 }} className="gap-2.5">
        <Text className="text-clinical-text text-2xl font-light tracking-wide">
          {session.patientName}
        </Text>
        <View className="flex-row gap-2">
          <Badge label={`Team ${session.teamCode}`} />
          <Badge label={`Program ${session.programCode}`} />
        </View>
      </View>

      {/* Indicator */}
      <View className="flex-1 items-center justify-center gap-8">
        <RecordingIndicator isRecording={isRecording} isPaused={isPaused} />
        <RecordingTimer seconds={elapsedSeconds} isRecording={isRecording} isPaused={isPaused} />
      </View>

      {/* Controls */}
      <RecordingControls
        isRecording={isRecording}
        isPaused={isPaused}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onStop={stop}
      />
    </View>
  )
}
