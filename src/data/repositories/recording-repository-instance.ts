import { RecordingRepository } from './recording-repository'
import { MockUploadService } from '../services/mock-upload-service'

export const recordingRepository = new RecordingRepository()
export const uploadService = new MockUploadService()
