import { pauseRecording } from '../../../domain/usecases/pauseRecording'
import { resumeRecording } from '../../../domain/usecases/resumeRecording'
import type { IRecordingService } from '../../../data/services/IRecordingService'
import type { PauseEvent } from '../../../domain/entities/Recording'

const makeService = (overrides: Partial<IRecordingService> = {}): IRecordingService => ({
  start: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(12.4),
  resume: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue({ uri: 'file://test.m4a', durationSeconds: 0 }),
  getCurrentPosition: jest.fn().mockResolvedValue(18.2),
  ...overrides,
})

describe('pauseRecording', () => {
  it('logs a pause event with the timestamp returned by the service', async () => {
    const service = makeService()
    const storePause = jest.fn()
    const addPauseEvent = jest.fn()

    await pauseRecording(service, storePause, addPauseEvent)

    expect(service.pause).toHaveBeenCalledTimes(1)
    expect(addPauseEvent).toHaveBeenCalledWith<[PauseEvent]>({ type: 'pause', timestamp: 12.4 })
    expect(storePause).toHaveBeenCalledTimes(1)
  })
})

describe('resumeRecording', () => {
  it('logs a resume event with the position after resuming', async () => {
    const service = makeService()
    const storeResume = jest.fn()
    const addPauseEvent = jest.fn()

    await resumeRecording(service, storeResume, addPauseEvent)

    expect(service.resume).toHaveBeenCalledTimes(1)
    expect(service.getCurrentPosition).toHaveBeenCalledTimes(1)
    expect(addPauseEvent).toHaveBeenCalledWith<[PauseEvent]>({ type: 'resume', timestamp: 18.2 })
    expect(storeResume).toHaveBeenCalledTimes(1)
  })
})
