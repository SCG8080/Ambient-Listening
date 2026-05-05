import type { IRecordingService } from '../../data/services/IRecordingService'

export type StartRecordingResult =
  | { success: true }
  | { success: false; error: 'permission_denied' | 'unknown' }

export async function startRecording(
  service: IRecordingService,
  storeStart: () => void,
  requestPermission: () => Promise<boolean>
): Promise<StartRecordingResult> {
  const granted = await requestPermission()
  if (!granted) {
    return { success: false, error: 'permission_denied' }
  }
  try {
    await service.start()
    storeStart()
    return { success: true }
  } catch {
    return { success: false, error: 'unknown' }
  }
}
