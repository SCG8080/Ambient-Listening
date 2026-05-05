// src/hooks/use-recorder.ts
import { useRef } from 'react'
import { Alert, Linking } from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useAudioRecorder, RecordingPresets, setAudioModeAsync } from 'expo-audio'
import { useRecordingStore } from '../store/recording-store'
import { useRecordingsStore } from '../store/recordings-store'
import { useSessionStore } from '../store/session-store'
import { startRecording } from '../domain/usecases/startRecording'
import { pauseRecording } from '../domain/usecases/pauseRecording'
import { resumeRecording } from '../domain/usecases/resumeRecording'
import { stopRecording } from '../domain/usecases/stopRecording'
import { AudioRecorderAdapter } from '../data/services/audio-recorder-adapter'
import { recordingRepository } from '../data/repositories/recording-repository-instance'
import { requestMicrophonePermission } from '../utils/permissions'

export function useRecorder() {
  const isTransitioning = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // expo-audio hook — returns a stable AudioRecorder instance
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  // Wrap in adapter once, using a ref so we don't recreate on every render
  const serviceRef = useRef<AudioRecorderAdapter | null>(null)
  if (!serviceRef.current) {
    serviceRef.current = new AudioRecorderAdapter(audioRecorder)
  }
  const service = serviceRef.current

  const isRecording = useRecordingStore((s) => s.isRecording)
  const isPaused = useRecordingStore((s) => s.isPaused)
  const elapsedSeconds = useRecordingStore((s) => s.elapsedSeconds)
  const storeStart = useRecordingStore((s) => s.start)
  const storePause = useRecordingStore((s) => s.pause)
  const storeResume = useRecordingStore((s) => s.resume)
  const storeReset = useRecordingStore((s) => s.reset)
  const setElapsed = useRecordingStore((s) => s.setElapsed)
  const addPauseEvent = useRecordingStore((s) => s.addPauseEvent)
  const setActiveReview = useRecordingsStore((s) => s.setActiveReview)

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed(useRecordingStore.getState().elapsedSeconds + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const start = async () => {
    if (isTransitioning.current || isRecording) return
    isTransitioning.current = true
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
      const result = await startRecording(service, storeStart, requestMicrophonePermission)
      if (!result.success) {
        if (result.error === 'permission_denied') {
          Alert.alert(
            'Microphone Access Required',
            'Please allow microphone access in Settings to record.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          )
        }
        return
      }
      startTimer()
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } finally {
      isTransitioning.current = false
    }
  }

  const pause = async () => {
    if (isTransitioning.current || !isRecording || isPaused) return
    isTransitioning.current = true
    try {
      stopTimer()
      await pauseRecording(service, storePause, addPauseEvent)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } finally {
      isTransitioning.current = false
    }
  }

  const resume = async () => {
    if (isTransitioning.current || !isRecording || !isPaused) return
    isTransitioning.current = true
    try {
      // Re-request audio session — Android drops it when the app is backgrounded
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
      await resumeRecording(service, storeResume, addPauseEvent)
      startTimer()
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // recorder is in a bad state — nothing more we can do without losing audio
    } finally {
      isTransitioning.current = false
    }
  }

  const stop = async () => {
    if (isTransitioning.current || !isRecording) return
    isTransitioning.current = true
    try {
      stopTimer()
      const currentPauseEvents = useRecordingStore.getState().pauseEvents
      const currentContext = useSessionStore.getState().context
      let id: string
      try {
        id = await stopRecording(service, recordingRepository, currentContext, currentPauseEvents)
      } catch {
        storeReset()
        return
      }
      storeReset()
      setActiveReview(id)
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      router.push('/(tabs)/review')
    } finally {
      isTransitioning.current = false
    }
  }

  return { isRecording, isPaused, elapsedSeconds, start, pause, resume, stop }
}
