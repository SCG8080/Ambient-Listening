import { View, Text, ViewProps } from 'react-native'

interface BadgeProps extends ViewProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline'
}

export function Badge({ label, variant = 'default', className, ...props }: BadgeProps) {
  let containerStyles = "rounded-md px-3 py-1 items-center justify-center"
  let textStyles = "text-xs tracking-wider font-semibold"

  switch (variant) {
    case 'default':
      containerStyles += " bg-background border border-border"
      textStyles += " text-clinical-secondary"
      break
    case 'success':
      containerStyles += " bg-success"
      textStyles += " text-white"
      break
    case 'error':
      containerStyles += " bg-danger"
      textStyles += " text-white"
      break
    case 'outline':
      containerStyles += " border border-primary"
      textStyles += " text-primary"
      break
  }

  return (
    <View className={`${containerStyles} ${className || ''}`} {...props}>
      <Text className={textStyles}>{label}</Text>
    </View>
  )
}
