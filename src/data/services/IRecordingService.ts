export interface IRecordingService {
  start(): Promise<void>
  pause(): Promise<number>      // returns position in seconds for pause event timestamp
  resume(): Promise<void>
  stop(): Promise<{ uri: string; durationSeconds: number }>
  getCurrentPosition(): Promise<number>
}
