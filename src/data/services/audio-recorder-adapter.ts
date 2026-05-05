import type { AudioRecorder } from 'expo-audio'
import type { IRecordingService } from './IRecordingService'

export class AudioRecorderAdapter implements IRecordingService {
  constructor(private readonly recorder: AudioRecorder) {}

  async start(): Promise<void> {
    await this.recorder.prepareToRecordAsync()
    this.recorder.record()
  }

  async pause(): Promise<number> {
    const timestamp = this.recorder.currentTime
    this.recorder.pause()
    return timestamp
  }

  async resume(): Promise<void> {
    this.recorder.record()
  }

  async stop(): Promise<{ uri: string; durationSeconds: number }> {
    const durationSeconds = this.recorder.currentTime
    await this.recorder.stop()
    const uri = this.recorder.uri ?? ''
    return { uri, durationSeconds }
  }

  async getCurrentPosition(): Promise<number> {
    return this.recorder.currentTime
  }
}
