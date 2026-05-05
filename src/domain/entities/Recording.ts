import type { SessionContext } from './SessionContext'

export interface PauseEvent {
  type: 'pause' | 'resume'
  timestamp: number  // seconds elapsed at the moment of the event
}

export type UploadStatus = 'draft' | 'uploading' | 'uploaded' | 'error'

export interface Recording {
  id: string
  uri: string                    // local file URI from expo-audio
  durationSeconds: number
  pauseEvents: PauseEvent[]
  session: SessionContext
  uploadStatus: UploadStatus
  createdAt: number              // unix milliseconds
}
