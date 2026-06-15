/**
 * Сессия покупателя (UI-уровень). Сейчас — мок для прохода флоу без бэкенда:
 * signIn(phone) помечает пользователя авторизованным. Реальная интеграция
 * (OTP, токен в expo-secure-store, guard маршрутов) подключается в Phase 3
 * по контракту бэкенда — поведение стора сохранится, поменяется реализация.
 */
import { create } from 'zustand';

type SessionState = {
  isAuthenticated: boolean;
  phone?: string;
  /** false, пока не выполнен bootstrap сессии на сплэше. */
  hasBootstrapped: boolean;
  signIn: (phone: string) => void;
  signOut: () => void;
  setHasBootstrapped: (value: boolean) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  // На ветке скриншотов EXPO_PUBLIC_SCREENSHOT=1 стартуем уже авторизованными,
  // чтобы CI открывал сразу Главную, а не онбординг. В обычной сборке флага нет → false.
  isAuthenticated: process.env.EXPO_PUBLIC_SCREENSHOT === '1',
  phone: undefined,
  hasBootstrapped: false,
  signIn: (phone) => set({ isAuthenticated: true, phone }),
  signOut: () => set({ isAuthenticated: false, phone: undefined }),
  setHasBootstrapped: (hasBootstrapped) => set({ hasBootstrapped }),
}));
