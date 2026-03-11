import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

export function Button({ title, loading, variant = 'primary', className, disabled, ...props }: ButtonProps) {
  const baseClasses = "rounded-xl px-4 py-3.5 items-center justify-center";
  const variantClasses = {
    primary: "bg-blue-600 active:bg-blue-700",
    secondary: "bg-white border border-blue-600",
    danger: "bg-red-500 active:bg-red-600"
  };
  const disabledClasses = (disabled || loading) ? "opacity-50" : "";

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#2563eb' : '#fff'} />
      ) : (
        <Text className={`font-semibold text-base ${variant === 'secondary' ? 'text-blue-600' : 'text-white'}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}
