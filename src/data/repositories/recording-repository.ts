import type { IRecordingRepository } from './IRecordingRepository'
import type { Recording, UploadStatus } from '../../domain/entities/Recording'
import { useRecordingsStore } from '../../store/recordings-store'

export class RecordingRepository implements IRecordingRepository {
  save(recording: Recording): void {
    useRecordingsStore.getState().addRecording(recording)
  }

  updateStatus(id: string, status: UploadStatus): void {
    useRecordingsStore.getState().updateStatus(id, status)
  }

  getById(id: string): Recording | undefined {
    return useRecordingsStore.getState().recordings[id]
  }
}
