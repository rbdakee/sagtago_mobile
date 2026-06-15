/**
 * zod-схемы валидации форм (react-hook-form + zodResolver). Сообщения об ошибках
 * пока на RU; на этапе локализации заменим на i18n-ключи в самих формах.
 * Энтити-схемы для парсинга ответов API добавим, когда будет контракт бэкенда.
 */
import { z } from 'zod';

import { COMPLAINT_REASONS, PAYMENT_METHODS } from './enums';

/** C-03: телефон в формате +7XXXXXXXXXX. */
export const phoneSchema = z.object({
  phone: z.string().regex(/^\+7\d{10}$/, 'Введите корректный номер'),
});
export type PhoneForm = z.infer<typeof phoneSchema>;

/** C-04: OTP (4 цифры; компонент допускает 4–6). */
export const otpSchema = z.object({
  code: z
    .string()
    .regex(/^\d{4}$/, 'Код из 4 цифр'),
});
export type OtpForm = z.infer<typeof otpSchema>;

/** C-09: бронь. */
export const bookingSchema = z.object({
  qty: z.number().int().min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
});
export type BookingForm = z.infer<typeof bookingSchema>;

/** C-15: оценка. */
export const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  text: z.string().max(500).optional(),
});
export type RatingForm = z.infer<typeof ratingSchema>;

/** C-16: жалоба — фото обязательно (R4). */
export const complaintSchema = z.object({
  reason: z.enum(COMPLAINT_REASONS),
  photos: z.array(z.string()).min(1, 'Добавьте фото'),
  description: z.string().min(1, 'Опишите проблему').max(1000),
});
export type ComplaintForm = z.infer<typeof complaintSchema>;
