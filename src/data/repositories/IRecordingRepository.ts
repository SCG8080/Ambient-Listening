import type { Recording, UploadStatus } from '../../domain/entities/Recording'

export interface IRecordingRepository {
  save(recording: Recording): void
  updateStatus(id: string, status: UploadStatus): void
  getById(id: string): Recording | undefined
}
