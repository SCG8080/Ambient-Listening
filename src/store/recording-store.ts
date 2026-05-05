// src/store/recording-store.ts
import { create } from 'zustand'
import type { PauseEvent } from '../domain/entities/Recording'

interface ActiveRecordingState {
  isRecording: boolean
  isPaused: boolean
  elapsedSeconds: number
  pauseEvents: PauseEvent[]
  start: () => void
  pause: () => void
  resume: () => void
  setElapsed: (s: number) => void
  addPauseEvent: (e: PauseEvent) => void
  reset: () => void
}

const initialState = {
  isRecording: false,
  isPaused: false,
  elapsedSeconds: 0,
  pauseEvents: [] as PauseEvent[],
}

export const useRecordingStore = create<ActiveRecordingState>()((set) => ({
  ...initialState,
  start: () => set({ isRecording: true, isPaused: false, elapsedSeconds: 0, pauseEvents: [] }),
  pause: () => set({ isPaused: true }),
  resume: () => set({ isPaused: false }),
  setElapsed: (elapsedSeconds) => set({ elapsedSeconds }),
  addPauseEvent: (e) => set((state) => ({ pauseEvents: [...state.pauseEvents, e] })),
  reset: () => set(initialState),
}))
