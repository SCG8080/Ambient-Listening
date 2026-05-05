import type { IUploadService } from './IUploadService'
import type { Recording } from '../../domain/entities/Recording'

export class MockUploadService implements IUploadService {
  async upload(_recording: Recording): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  }
}
