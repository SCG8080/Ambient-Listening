// src/store/recordings-store.ts
import { create } from 'zustand'
import type { Recording, UploadStatus } from '../domain/entities/Recording'

interface RecordingsState {
  recordings: Record<string, Recording>
  activeReviewId: string | null
  addRecording: (r: Recording) => void
  updateStatus: (id: string, status: UploadStatus) => void
  setActiveReview: (id: string) => void
}

export const useRecordingsStore = create<RecordingsState>()((set) => ({
  recordings: {},
  activeReviewId: null,
  addRecording: (r) =>
    set((state) => ({ recordings: { ...state.recordings, [r.id]: r } })),
  updateStatus: (id, status) =>
    set((state) => ({
      recordings: {
        ...state.recordings,
        [id]: { ...state.recordings[id], uploadStatus: status },
      },
    })),
  setActiveReview: (id) => set({ activeReviewId: id }),
}))
