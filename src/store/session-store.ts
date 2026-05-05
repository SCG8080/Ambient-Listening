// src/store/session-store.ts
import { create } from 'zustand'
import type { SessionContext } from '../domain/entities/SessionContext'

interface SessionState {
  context: SessionContext
  setContext: (ctx: SessionContext) => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  context: {
    patientName: 'John Doe',
    teamCode: 'T00',
    programCode: 'P10',
    source: 'manual',
  },
  setContext: (ctx) => set({ context: ctx }),
}))
