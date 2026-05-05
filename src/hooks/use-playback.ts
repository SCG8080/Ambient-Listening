// src/hooks/use-playback.ts
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
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

  const play = () => {
    if (!recording) return
    player.play()
  }

  const pause = () => {
    player.pause()
  }

  return { recording, isPlaying, play, pause }
}
