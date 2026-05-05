import { AudioModule } from 'expo-audio'

export async function requestMicrophonePermission(): Promise<boolean> {
  const status = await AudioModule.requestRecordingPermissionsAsync()
  return status.granted
}
