import { Tabs } from 'expo-router'
import { Pressable, type ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { useRecordingsStore } from '../../src/store/recordings-store'

export default function TabLayout() {
  const activeReviewId = useRecordingsStore((s) => s.activeReviewId)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#091422',
          borderTopColor: '#1A3A5C',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#4A9EFF',
        tabBarInactiveTintColor: '#6B8BAA',
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 1 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'SESSIONS',
          tabBarIcon: ({ color }) => (
            <Image source="sf:list.bullet" style={{ width: 22, height: 22, tintColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'RECORD',
          tabBarIcon: ({ color }) => (
            <Image source="sf:mic" style={{ width: 22, height: 22, tintColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'REVIEW',
          tabBarIcon: ({ color }) => (
            <Image
              source="sf:headphones"
              style={{ width: 22, height: 22, tintColor: activeReviewId ? color : '#2E6DB4' }}
            />
          ),
          tabBarButton: (props) =>
            activeReviewId ? (
              <Pressable {...(props as any)} />
            ) : (
              <Pressable
                {...(props as any)}
                disabled
                style={[props.style as ViewStyle, { opacity: 0.4 }]}
              />
            ),
        }}
      />
    </Tabs>
  )
}
