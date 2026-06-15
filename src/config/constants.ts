/** Бизнес- и UX-константы приложения в одном месте (ARCHITECTURE §11). */
export { SERVICE_FEE_PCT } from '@/domain';

/** Длина OTP-кода (DESIGN допускает 4–6; берём 4). */
export const OTP_LENGTH = 4;
/** Таймер до повторной отправки OTP, сек. */
export const OTP_RESEND_SECONDS = 60;
/** Hold-резерв остатка на время оплаты, мин (BP-05, открытый вопрос — ориентир). */
export const HOLD_TIMEOUT_MINUTES = 8;
/** За сколько до конца окна слать напоминание о выдаче, мин (BP-07). */
export const PICKUP_REMINDER_BEFORE_MINUTES = 30;
/** Минимальный тач-таргет, px (DESIGN §2.5). */
export const MIN_TOUCH_TARGET = 44;
/** Город по умолчанию, если нет гео (BP-02). */
export const DEFAULT_CITY = 'Алматы';
