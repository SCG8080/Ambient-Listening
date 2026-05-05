import { startRecording } from '../../../domain/usecases/startRecording'
import type { IRecordingService } from '../../../data/services/IRecordingService'

const mockService: IRecordingService = {
  start: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn().mockResolvedValue(0),
  resume: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue({ uri: 'file://test.m4a', durationSeconds: 0 }),
  getCurrentPosition: jest.fn().mockResolvedValue(0),
}

describe('startRecording', () => {
  const mockStoreStart = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('returns success when permission is granted', async () => {
    const requestPermission = jest.fn().mockResolvedValue(true)
    const result = await startRecording(mockService, mockStoreStart, requestPermission)
    expect(result).toEqual({ success: true })
    expect(mockService.start).toHaveBeenCalledTimes(1)
    expect(mockStoreStart).toHaveBeenCalledTimes(1)
  })

  it('returns permission_denied when permission is not granted', async () => {
    const requestPermission = jest.fn().mockResolvedValue(false)
    const result = await startRecording(mockService, mockStoreStart, requestPermission)
    expect(result).toEqual({ success: false, error: 'permission_denied' })
    expect(mockService.start).not.toHaveBeenCalled()
    expect(mockStoreStart).not.toHaveBeenCalled()
  })

  it('returns unknown error when service throws', async () => {
    const requestPermission = jest.fn().mockResolvedValue(true)
    ;(mockService.start as jest.Mock).mockRejectedValueOnce(new Error('Audio failure'))
    const result = await startRecording(mockService, mockStoreStart, requestPermission)
    expect(result).toEqual({ success: false, error: 'unknown' })
    expect(mockStoreStart).not.toHaveBeenCalled()
  })
})
