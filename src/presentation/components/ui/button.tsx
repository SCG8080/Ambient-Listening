import { Pressable, Text, PressableProps } from 'react-native'
import { Image } from 'expo-image'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

interface ButtonProps extends PressableProps {
  label: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Button({ label, icon, variant = 'primary', className, ...props }: ButtonProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const baseStyles = "flex-row items-center justify-center rounded-xl px-6 py-4 gap-2"
  
  let variantStyles = ""
  let textStyles = "text-sm font-bold tracking-widest"
  let iconTint = ""

  switch (variant) {
    case 'primary':
      variantStyles = "bg-primary"
      textStyles += " text-white"
      iconTint = "white"
      break
    case 'secondary':
      variantStyles = "bg-primary-light"
      textStyles += " text-white"
      iconTint = "white"
      break
    case 'outline':
      variantStyles = "bg-card border border-border"
      textStyles += " text-clinical-text"
      iconTint = "#1E293B"
      break
    case 'danger':
      variantStyles = "bg-danger"
      textStyles += " text-white"
      iconTint = "white"
      break
    case 'success':
      variantStyles = "bg-success"
      textStyles += " text-white"
      iconTint = "white"
      break
  }

  if (props.disabled) {
    variantStyles += " opacity-50"
  }

  return (
    <AnimatedPressable
      className={`${baseStyles} ${variantStyles} ${className || ''}`}
      onPressIn={(e) => {
        scale.value = withSpring(0.96)
        props.onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1)
        props.onPressOut?.(e)
      }}
      {...props}
    >
      {icon && (
        <Image 
          source={icon} 
          style={{ width: 20, height: 20, tintColor: iconTint }} 
        />
      )}
      <Text className={textStyles}>{label}</Text>
    </AnimatedPressable>
  )
}
