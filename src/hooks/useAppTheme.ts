import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

export function useAppTheme() {
  const systemColorScheme = useSystemColorScheme();
  const themePreference = useSelector((state: any) => state.settings?.theme || 'system');

  if (themePreference === 'system') {
    return systemColorScheme === 'dark';
  }
  
  return themePreference === 'dark';
}
