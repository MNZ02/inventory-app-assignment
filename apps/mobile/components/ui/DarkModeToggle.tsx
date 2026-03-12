import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const { themePreference, cycleTheme, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'phone-portrait-outline';
  if (themePreference === 'light') {
    iconName = 'sunny-outline';
  } else if (themePreference === 'dark') {
    iconName = 'moon-outline';
  } else if (themePreference === 'system') {
    iconName = 'phone-portrait-outline';
  }

  return (
    <TouchableOpacity
      onPress={cycleTheme}
      className={`w-10 h-10 rounded-full border border-border dark:border-border-dark items-center justify-center bg-card dark:bg-card-dark ${className || ''}`}
    >
      <Ionicons
        name={iconName}
        size={20}
        color={isDark ? '#F9FAFB' : '#111111'}
      />
    </TouchableOpacity>
  );
}
