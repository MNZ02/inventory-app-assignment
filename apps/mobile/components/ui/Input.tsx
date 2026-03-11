import { Text, TextInput, View, type TextInputProps } from 'react-native'
import { useState } from 'react'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, className, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className || ''}`}>
      {label ? <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text> : null}
      <TextInput
        className={`border rounded-xl px-4 py-3 bg-white text-gray-900 text-base font-sans ${isFocused ? 'border-blue-500' : error ? 'border-red-400' : 'border-gray-200'}`}
        placeholderTextColor="#9ca3af"
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
      {error ? <Text className="text-sm text-red-500 mt-1">{error}</Text> : null}
    </View>
  )
}
