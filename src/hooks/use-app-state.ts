// src/hooks/use-app-state.ts
import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

export function useAppState(onBackground: () => void) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState === 'background') {
        onBackground()
      }
      appStateRef.current = nextState
    })

    return () => subscription.remove()
  }, [onBackground])
}
