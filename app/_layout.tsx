/**
 * Корневой layout — ФУНДАМЕНТ-ФАЙЛ (агенты не редактируют).
 * Провайдеры: SafeArea → Query → Theme. Грузит бренд-шрифты (Unbounded + Onest)
 * до рендера и синхронизирует язык i18n с prefsStore. Все экраны рендерятся
 * внутри <Stack> (expo-router, file-based) без шапок по умолчанию.
 */
import '@/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import {
  Onest_400Regular,
  Onest_500Medium,
  Onest_600SemiBold,
  Onest_700Bold,
} from '@expo-google-fonts/onest';
import {
  Unbounded_400Regular,
  Unbounded_500Medium,
  Unbounded_600SemiBold,
  Unbounded_700Bold,
} from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/data';
import { syncLanguage } from '@/i18n';
import { usePrefsStore } from '@/store/prefsStore';
import { ThemeProvider, useTheme } from '@/theme';

function RootNavigator() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Unbounded_400Regular,
    Unbounded_500Medium,
    Unbounded_600SemiBold,
    Unbounded_700Bold,
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
  });

  const language = usePrefsStore((s) => s.language);
  const hasHydrated = usePrefsStore((s) => s.hasHydrated);

  useEffect(() => {
    syncLanguage(language);
  }, [language]);

  // Ждём шрифты и гидрацию предпочтений, чтобы не мигать дефолтной темой/языком.
  if (!fontsLoaded || !hasHydrated) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
