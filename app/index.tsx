/**
 * C-01 Splash / bootstrap. Сейчас (мок, без auth-флоу) сразу уводит в табы.
 * Auth-агент (Wave 2) заменит на: bootstrap сессии из secure-store →
 * редирект в (tabs) или (auth)/phone. Точка гейта — здесь.
 */
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)" />;
}
