import { View, Text, ScrollView, Pressable } from 'react-native'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { useRecordingsStore } from '@/store/recordings-store'
import { useRecordingStore } from '@/store/recording-store'
import { RecordingListItem } from '@/presentation/components/recording-list-item'

export function RecordingsListScreen() {
  const recordings = useRecordingsStore((s) => s.recordings)
  const setActiveReview = useRecordingsStore((s) => s.setActiveReview)
  const isRecording = useRecordingStore((s) => s.isRecording)
  const list = Object.values(recordings).sort((a, b) => b.createdAt - a.createdAt)

  const handleOpen = (id: string) => {
    setActiveReview(id)
    router.push('/(tabs)/review')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F1B2D', paddingHorizontal: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 20, paddingBottom: 20 }}>
        <View>
          <Text style={{ color: '#E8F4FF', fontSize: 28, fontWeight: '300', letterSpacing: 1 }}>
            Recordings
          </Text>
          <Text style={{ color: '#6B8BAA', fontSize: 13, marginTop: 2 }}>
            {list.length} session{list.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {!isRecording && (
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A3A5C',
              borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, gap: 8,
              borderWidth: 1, borderColor: '#2E6DB4' }}
            onPress={() => router.push('/(tabs)/record')}
          >
            <Image source="sf:mic.fill" style={{ width: 18, height: 18, tintColor: '#E8F4FF' }} />
            <Text style={{ color: '#E8F4FF', fontSize: 12, letterSpacing: 2, fontWeight: '600' }}>NEW</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
            <Image source="sf:mic.slash" style={{ width: 48, height: 48, tintColor: '#2E6DB4' }} />
            <Text style={{ color: '#A8C4E0', fontSize: 18, fontWeight: '300' }}>No recordings yet</Text>
            <Text style={{ color: '#6B8BAA', fontSize: 13, textAlign: 'center' }}>
              Tap NEW to start your first session
            </Text>
          </View>
        ) : (
          list.map((rec) => (
            <RecordingListItem key={rec.id} recording={rec} onPress={() => handleOpen(rec.id)} />
          ))
        )}
      </ScrollView>
    </View>
  )
}
