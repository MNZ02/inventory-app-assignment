import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps, View } from 'react-native'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'outlined' | 'ghost' | 'outlined-danger' | 'ghost-primary'
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
    primary: "bg-[#A78BFA] active:bg-[#7C3AED] dark:bg-[#A78BFA] dark:active:bg-[#7C3AED]",
    secondary: "bg-[#EDE9FE] dark:bg-primary-dark/20 active:bg-violet-200 dark:active:bg-primary-dark/30",
    danger: "bg-[#EF4444] dark:bg-danger-dark active:bg-red-600 dark:active:bg-red-700",
    outlined: "bg-transparent border border-[#A78BFA] dark:border-primary active:bg-primary-light dark:active:bg-primary-dark/10",
    'outlined-danger': "bg-white dark:bg-card-dark border border-[#EF4444] active:bg-red-50 dark:active:bg-red-900/20",
    ghost: "bg-transparent active:bg-primary-light dark:active:bg-primary-dark/10",
    'ghost-primary': "bg-transparent border border-[#A78BFA] active:bg-primary-light dark:active:bg-primary-dark/10"
  };

  const textVariantClasses = {
    primary: "text-white",
    secondary: "text-[#7C3AED] dark:text-[#A78BFA]",
    danger: "text-white",
    outlined: "text-[#A78BFA] dark:text-[#A78BFA]",
    'outlined-danger': "text-[#EF4444]",
    ghost: "text-[#A78BFA] dark:text-[#A78BFA]",
    'ghost-primary': "text-[#A78BFA] dark:text-[#A78BFA]"
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
