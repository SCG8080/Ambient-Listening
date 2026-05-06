import { View, Text, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRecordingsStore } from '@/store/recordings-store'
import { useRecordingStore } from '@/store/recording-store'
import { RecordingListItem } from '@/presentation/components/recording-list-item'
import { Button } from '../components/ui/button'

export function RecordingsListScreen() {
  const insets = useSafeAreaInsets()
  const recordings = useRecordingsStore((s) => s.recordings)
  const setActiveReview = useRecordingsStore((s) => s.setActiveReview)
  const isRecording = useRecordingStore((s) => s.isRecording)
  const list = Object.values(recordings).sort((a, b) => b.createdAt - a.createdAt)

  const handleOpen = (id: string) => {
    setActiveReview(id)
    router.push('/(tabs)/review')
  }

  return (
    <View className="flex-1 bg-background px-5">
      <View 
        className="flex-row justify-between items-center pb-5"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View>
          <Text className="text-clinical-text text-3xl font-light tracking-wide">
            Recordings
          </Text>
          <Text className="text-clinical-muted text-sm mt-1">
            {list.length} session{list.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {!isRecording && (
          <Button 
            label="NEW" 
            icon="sf:mic.fill" 
            variant="outline" 
            onPress={() => router.push('/(tabs)/record')} 
            className="py-2.5 px-4"
          />
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View className="items-center justify-center pt-20 gap-3">
            <Image source="sf:mic.slash" style={{ width: 48, height: 48, tintColor: '#CBD5E1' }} />
            <Text className="text-clinical-secondary text-lg font-light">No recordings yet</Text>
            <Text className="text-clinical-muted text-sm text-center">
              Tap NEW to start your first session
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {list.map((rec) => (
              <RecordingListItem key={rec.id} recording={rec} onPress={() => handleOpen(rec.id)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
