/**
 * C-01 Гейт сессии. Авторизован → табы, иначе → онбординг/авторизация.
 * Bootstrap сессии пока мок (sessionStore — in-memory). Реальный bootstrap из
 * expo-secure-store подключит auth-интеграция по контракту бэкенда (Phase 3),
 * точка гейта остаётся здесь.
 */
import { Redirect } from 'expo-router';

import { useSessionStore } from '@/store/sessionStore';

export default function Index() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/onboarding'} />;
}
