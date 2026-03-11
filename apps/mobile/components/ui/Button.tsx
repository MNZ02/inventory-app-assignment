import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps, View } from 'react-native'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'outlined' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

export function Button({ 
  title, 
  loading, 
  variant = 'primary', 
  size = 'md',
  fullWidth = true,
  className, 
  disabled, 
  ...props 
}: ButtonProps) {
  const baseClasses = "rounded-[14px] items-center justify-center flex-row";
  
  const sizeClasses = {
    sm: "px-3 py-2 h-10",
    md: "px-4 py-3 h-[52px]",
    lg: "px-6 py-4 h-[60px]"
  };

  const variantClasses = {
    primary: "bg-primary active:bg-primary-dark",
    secondary: "bg-primary-light active:bg-violet-200",
    danger: "bg-danger active:bg-red-600",
    outlined: "bg-transparent border border-primary active:bg-primary-light",
    ghost: "bg-transparent active:bg-primary-light"
  };

  const textVariantClasses = {
    primary: "text-white",
    secondary: "text-primary-dark",
    danger: "text-white",
    outlined: "text-primary",
    ghost: "text-primary"
  };

  const disabledClasses = (disabled || loading) ? "opacity-50" : "";
  const widthClass = fullWidth ? "w-full" : "self-start";

  return (
    <TouchableOpacity
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textVariantClasses[variant] === 'text-white' ? '#fff' : '#A78BFA'} />
      ) : (
        <Text className={`font-bold text-base ${textVariantClasses[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}
