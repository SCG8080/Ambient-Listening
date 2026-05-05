export interface SessionContext {
  patientName: string
  teamCode: string
  programCode: string
  source?: 'deeplink' | 'manual'
}
