import { stopRecording } from '../../../domain/usecases/stopRecording'
import type { IRecordingService } from '../../../data/services/IRecordingService'
import type { IRecordingRepository } from '../../../data/repositories/IRecordingRepository'
import type { SessionContext } from '../../../domain/entities/SessionContext'
import type { PauseEvent } from '../../../domain/entities/Recording'

const mockService: IRecordingService = {
  start: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  stop: jest.fn().mockResolvedValue({ uri: 'file://rec.m4a', durationSeconds: 47.3 }),
  getCurrentPosition: jest.fn(),
}

const mockRepository: IRecordingRepository = {
  save: jest.fn(),
  updateStatus: jest.fn(),
  getById: jest.fn(),
}

const session: SessionContext = {
  patientName: 'John Doe',
  teamCode: 'T00',
  programCode: 'P10',
  source: 'manual',
}

const pauseEvents: PauseEvent[] = [
  { type: 'pause', timestamp: 12.4 },
  { type: 'resume', timestamp: 18.2 },
]

describe('stopRecording', () => {
  beforeEach(() => jest.clearAllMocks())

  it('stops the service, saves the recording, and returns an id', async () => {
    const id = await stopRecording(mockService, mockRepository, session, pauseEvents)

    expect(mockService.stop).toHaveBeenCalledTimes(1)
    expect(mockRepository.save).toHaveBeenCalledTimes(1)

    const saved = (mockRepository.save as jest.Mock).mock.calls[0][0]
    expect(saved.id).toBe(id)
    expect(saved.uri).toBe('file://rec.m4a')
    expect(saved.durationSeconds).toBe(47.3)
    expect(saved.pauseEvents).toEqual(pauseEvents)
    expect(saved.session).toEqual(session)
    expect(saved.uploadStatus).toBe('draft')
    expect(typeof saved.createdAt).toBe('number')
  })

  it('returns a non-empty string id', async () => {
    const id = await stopRecording(mockService, mockRepository, session, [])
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
})
