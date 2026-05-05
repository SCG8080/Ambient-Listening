import type { IRecordingService } from '../../data/services/IRecordingService'
import type { PauseEvent } from '../entities/Recording'

export async function resumeRecording(
  service: IRecordingService,
  storeResume: () => void,
  addPauseEvent: (e: PauseEvent) => void
): Promise<void> {
  await service.resume()
  const timestamp = await service.getCurrentPosition()
  addPauseEvent({ type: 'resume', timestamp })
  storeResume()
}
