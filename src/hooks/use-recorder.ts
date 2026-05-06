// src/hooks/use-recorder.ts
import { RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Alert, Linking } from 'react-native'
import { recordingRepository } from '../data/repositories/recording-repository-instance'
import { AudioRecorderAdapter } from '../data/services/audio-recorder-adapter'
import { pauseRecording } from '../domain/usecases/pauseRecording'
import { resumeRecording } from '../domain/usecases/resumeRecording'
import { startRecording } from '../domain/usecases/startRecording'
import { stopRecording } from '../domain/usecases/stopRecording'
import { useRecordingStore } from '../store/recording-store'
import { useRecordingsStore } from '../store/recordings-store'
import { useSessionStore } from '../store/session-store'
import { requestMicrophonePermission } from '../utils/permissions'

// Custom preset for Android to better handle interruptions
const CLINICAL_RECORDING_PRESET = {
  ...RecordingPresets.HIGH_QUALITY,
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    // Using voice_communication helps Android manage audio focus loss 
    // more effectively during phone calls, similar to native communication apps.
    audioSource: 'voice_communication',
  },
}

export function useRecorder() {
  const isTransitioning = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // expo-audio hook — returns a stable AudioRecorder instance
  const audioRecorder = useAudioRecorder(CLINICAL_RECORDING_PRESET, (status) => {
    if (status.hasError) {
      console.warn('Audio recorder error:', status.error)
      // Automatically sync store if native recorder hits an error
      if (useRecordingStore.getState().isRecording && !useRecordingStore.getState().isPaused) {
        useRecordingStore.getState().pause()
      }
    }
  })
  
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
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
        interruptionMode: 'doNotMix', // Exclusive focus is critical for Android call detection
        allowsBackgroundRecording: false,
      })
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
      await resumeRecording(service, storeResume, addPauseEvent)
      startTimer()
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Native recorder state was lost during backgrounding — recover UI so it isn't stuck
      storeResume()
      startTimer()
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

  // Poll faster (200ms) to ensure focus loss is detected immediately on Android
  const recorderState = useAudioRecorderState(audioRecorder, 200)

  // Sync store state with native recorder state (handles external interruptions like phone calls)
  useEffect(() => {
    const shouldBeRecording = isRecording && !isPaused
    const actuallyRecording = recorderState.isRecording
    const systemReset = recorderState.mediaServicesDidReset

    if ((shouldBeRecording && !actuallyRecording) || systemReset) {
      if (!isTransitioning.current) {
        // The native recorder stopped or services reset (likely due to a system interruption).
        // We must sync our store so the UI doesn't show a running timer.
        pause()
      }
    }
  }, [recorderState.isRecording, recorderState.mediaServicesDidReset, isRecording, isPaused, pause])

  return { isRecording, isPaused, elapsedSeconds, start, pause, resume, stop }
}
