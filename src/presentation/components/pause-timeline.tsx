import { View, Text } from 'react-native'
import type { DimensionValue } from 'react-native'
import type { PauseEvent } from '@/domain/entities/Recording'
import { formatTime } from '@/utils/formatTime'

interface PauseTimelineProps {
  pauseEvents: PauseEvent[]
  durationSeconds: number
}

export function PauseTimeline({ pauseEvents, durationSeconds }: PauseTimelineProps) {
  if (durationSeconds === 0) return null

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: '#6B8BAA', fontSize: 11, letterSpacing: 2 }}>TIMELINE</Text>
      <View style={{ height: 32, justifyContent: 'center', position: 'relative' }}>
        <View style={{ position: 'absolute', left: 0, right: 0, height: 2,
          backgroundColor: '#2E6DB4', borderRadius: 1 }} />
        {pauseEvents.map((event, i) => {
          const position = (event.timestamp / durationSeconds) * 100
          const left: DimensionValue = `${Math.min(position, 98)}%`
          return (
            <View
              key={i}
              style={{ position: 'absolute', width: 2, height: 16, borderRadius: 1,
                bottom: 8, alignItems: 'center', left,
                backgroundColor: event.type === 'pause' ? '#F59E0B' : '#34D399' }}
            >
              <Text style={{ position: 'absolute', bottom: 18, color: '#A8C4E0', fontSize: 9,
                width: 36, textAlign: 'center', left: -17 }}>
                {formatTime(event.timestamp)}
              </Text>
            </View>
          )
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' }} />
          <Text style={{ color: '#6B8BAA', fontSize: 11 }}>Pause</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399' }} />
          <Text style={{ color: '#6B8BAA', fontSize: 11 }}>Resume</Text>
        </View>
      </View>
    </View>
  )
}
