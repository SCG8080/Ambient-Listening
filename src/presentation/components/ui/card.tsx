import { View, ViewProps } from 'react-native'

export function Card({ className, ...props }: ViewProps) {
  return (
    <View 
      className={`bg-card rounded-2xl p-5 border border-border shadow-sm ${className || ''}`}
      {...props}
    />
  )
}
