import type { IRecordingService } from '../../data/services/IRecordingService'
import type { PauseEvent } from '../entities/Recording'

export async function pauseRecording(
  service: IRecordingService,
  storePause: () => void,
  addPauseEvent: (e: PauseEvent) => void
): Promise<void> {
  const timestamp = await service.pause()
  addPauseEvent({ type: 'pause', timestamp })
  storePause()
}
