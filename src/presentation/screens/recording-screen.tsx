import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRecorder } from '@/hooks/use-recorder'
import { useAppState } from '@/hooks/use-app-state'
import { useSessionStore } from '@/store/session-store'
import { RecordingIndicator } from '@/presentation/components/recording-indicator'
import { RecordingTimer } from '@/presentation/components/recording-timer'
import { RecordingControls } from '@/presentation/components/recording-controls'

export function RecordingScreen() {
  const insets = useSafeAreaInsets()
  const { isRecording, isPaused, elapsedSeconds, start, pause, resume, stop } = useRecorder()
  const session = useSessionStore((s) => s.context)

  useAppState(() => {
    if (isRecording && !isPaused) {
      pause()
    }
  })

  return (
    <View style={{ flex: 1, backgroundColor: '#0F1B2D', paddingHorizontal: 24,
      justifyContent: 'space-between', paddingBottom: 32 }}>
      {/* Session header */}
      <View style={{ paddingTop: insets.top + 12, gap: 10 }}>
        <Text style={{ color: '#E8F4FF', fontSize: 22, fontWeight: '300', letterSpacing: 0.5 }}>
          {session.patientName}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ backgroundColor: '#1A3A5C', borderRadius: 8, paddingHorizontal: 12,
            paddingVertical: 5, borderWidth: 1, borderColor: '#2E6DB4' }}>
            <Text style={{ color: '#A8C4E0', fontSize: 12, letterSpacing: 1 }}>
              Team {session.teamCode}
            </Text>
          </View>
          <View style={{ backgroundColor: '#1A3A5C', borderRadius: 8, paddingHorizontal: 12,
            paddingVertical: 5, borderWidth: 1, borderColor: '#2E6DB4' }}>
            <Text style={{ color: '#A8C4E0', fontSize: 12, letterSpacing: 1 }}>
              Program {session.programCode}
            </Text>
          </View>
        </View>
      </View>

      {/* Indicator */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
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
