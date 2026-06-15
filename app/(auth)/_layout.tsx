/**
 * Layout группы авторизации (C-02…C-05). Стек без шапок — свои заголовки рисуем
 * внутри экранов. Группа `(auth)` прозрачна в URL (онбординг → /onboarding и т.д.).
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
