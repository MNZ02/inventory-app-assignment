import { Text, TextInput, View, type TextInputProps, TouchableOpacity } from 'react-native'
import { useState, type ReactNode } from 'react'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
  containerStyle?: string
  containerClassName?: string
}

export function Input({ 
  label, 
  error, 
  leftIcon, 
  rightIcon, 
  className, 
  containerStyle, 
  containerClassName,
  onFocus, 
  onBlur, 
  ...props 
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${containerStyle || ''}`}>
      {label ? (
        <Text
          className="mb-1.5 text-text-primary dark:text-text-primary-dark"
          style={{ fontWeight: '600', fontSize: 13 }}
        >
          {label}
        </Text>
      ) : null}
      <View 
        className={`flex-row items-center bg-background dark:bg-card-dark rounded-[12px] px-4 min-h-[52px] border ${
          isFocused ? 'border-primary' : error ? 'border-danger dark:border-danger-dark' : 'border-transparent dark:border-border-dark'
        } ${containerClassName || ''}`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`flex-1 text-text-primary dark:text-text-primary-dark text-[15px] py-3 ${className || ''}`}
          placeholderTextColor="#6B7280"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error ? <Text className="text-sm text-danger dark:text-danger mt-1 font-medium">{error}</Text> : null}
    </View>
  )
}
