import type { IUploadService } from '../../data/services/IUploadService'
import type { IRecordingRepository } from '../../data/repositories/IRecordingRepository'

export async function uploadRecording(
  uploadService: IUploadService,
  repository: IRecordingRepository,
  recordingId: string
): Promise<void> {
  const recording = repository.getById(recordingId)
  if (!recording) {
    throw new Error(`Recording ${recordingId} not found`)
  }
  repository.updateStatus(recordingId, 'uploading')
  try {
    await uploadService.upload(recording)
    repository.updateStatus(recordingId, 'uploaded')
  } catch (err) {
    repository.updateStatus(recordingId, 'error')
    throw err
  }
}
