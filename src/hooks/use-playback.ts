// src/hooks/use-playback.ts
import { useEffect } from 'react'
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio'
import { useRecordingsStore } from '../store/recordings-store'
import type { Recording } from '../domain/entities/Recording'

export function usePlayback() {
  const activeReviewId = useRecordingsStore((s) => s.activeReviewId)
  const recordings = useRecordingsStore((s) => s.recordings)
  const recording: Recording | null = activeReviewId ? (recordings[activeReviewId] ?? null) : null

  const player = useAudioPlayer(recording ? { uri: recording.uri } : null)
  // Derive isPlaying from actual player status so end-of-file auto-resets to false
  const status = useAudioPlayerStatus(player)
  const isPlaying = status.playing

  useEffect(() => {
    // Ensure audio is routed to speaker and recording mode is disabled during playback
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      interruptionMode: 'doNotMix',
      shouldRouteThroughEarpiece: false,
    })
  }, [])

  const play = () => {
    if (!recording) return
    // If the player is at the end, reset to beginning so it can play again
    if (status.currentTime >= status.duration) {
      player.seekTo(0)
    }
    player.play()
  }

  const pause = () => {
    player.pause()
  }

  return { recording, isPlaying, play, pause }
}
