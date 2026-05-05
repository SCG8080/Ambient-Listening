import type { Recording } from '../../domain/entities/Recording'

export interface IUploadService {
  upload(recording: Recording): Promise<void>
}
