// src/hooks/use-playback.ts
import { useState } from 'react'
import { useAudioPlayer } from 'expo-audio'
import { useRecordingsStore } from '../store/recordings-store'
import type { Recording } from '../domain/entities/Recording'

export function usePlayback() {
  const [isPlaying, setIsPlaying] = useState(false)

  const activeReviewId = useRecordingsStore((s) => s.activeReviewId)
  const recordings = useRecordingsStore((s) => s.recordings)
  const recording: Recording | null = activeReviewId ? (recordings[activeReviewId] ?? null) : null

  const player = useAudioPlayer(recording ? { uri: recording.uri } : null)

  const play = () => {
    if (!recording || !player) return
    player.play()
    setIsPlaying(true)
  }

  const pause = () => {
    if (!player) return
    player.pause()
    setIsPlaying(false)
  }

  return { recording, isPlaying, play, pause }
}
