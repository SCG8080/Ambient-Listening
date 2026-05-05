// src/hooks/use-app-state.ts
import { useEffect, useRef } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

export function useAppState(onBackground: () => void, onForeground?: () => void) {
  const bgRef = useRef(onBackground)
  bgRef.current = onBackground
  const fgRef = useRef(onForeground)
  fgRef.current = onForeground
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current === 'active' && nextState === 'background') {
        bgRef.current()
      } else if (appStateRef.current !== 'active' && nextState === 'active') {
        fgRef.current?.()
      }
      appStateRef.current = nextState
    })

    return () => subscription.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
