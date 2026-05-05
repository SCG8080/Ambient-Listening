import '../global.css'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { ThemeProvider, DarkTheme, type Theme } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync()

const NavyTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0F1B2D',
    card: '#091422',
    primary: '#4A9EFF',
    border: '#1A3A5C',
    text: '#E8F4FF',
    notification: '#E53935',
  },
}

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NavyTheme}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F1B2D' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
