// src/hooks/use-app-state.ts
import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

export function useAppState(onBackground: () => void) {
  const callbackRef = useRef(onBackground)
  callbackRef.current = onBackground
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState === 'background') {
        callbackRef.current()
      }
      appStateRef.current = nextState
    })

    return () => subscription.remove()
    // callbackRef and appStateRef are stable refs — subscription registered once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
