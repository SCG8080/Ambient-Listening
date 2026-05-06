import { View } from 'react-native'
import { Button } from './ui/button'

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
      <View className="flex-row items-center">
        <Button
          label="START RECORDING"
          icon="sf:mic.fill"
          variant="outline"
          onPress={onStart}
          className="flex-1 py-4"
        />
      </View>
    )
  }

  return (
    <View className="flex-row gap-4 items-center">
      <Button
        label="STOP"
        icon="sf:stop.fill"
        variant="outline"
        onPress={onStop}
        className="py-4"
      />

      {isPaused ? (
        <Button
          label="RESUME"
          icon="sf:play.fill"
          variant="outline"
          onPress={onResume}
          className="flex-1 py-4"
        />
      ) : (
        <Button
          label="PAUSE"
          icon="sf:pause.fill"
          variant="primary"
          onPress={onPause}
          className="flex-1 py-4"
        />
      )}
    </View>
  )
}
