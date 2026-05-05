import type { IRecordingService } from '../../data/services/IRecordingService'
import type { IRecordingRepository } from '../../data/repositories/IRecordingRepository'
import type { Recording, PauseEvent } from '../entities/Recording'
import type { SessionContext } from '../entities/SessionContext'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function stopRecording(
  service: IRecordingService,
  repository: IRecordingRepository,
  session: SessionContext,
  pauseEvents: PauseEvent[]
): Promise<string> {
  const { uri, durationSeconds } = await service.stop()
  const recording: Recording = {
    id: generateId(),
    uri,
    durationSeconds,
    pauseEvents,
    session,
    uploadStatus: 'draft',
    createdAt: Date.now(),
  }
  repository.save(recording)
  return recording.id
}
