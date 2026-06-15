/**
 * Статусы и перечисления домена — из BP.md §2. Кортежи `as const` служат и
 * источником union-типов, и runtime-списками (для бейджей, фильтров, zod).
 */

/** Заказ: created → paid → picked_up | expired | refunded | payment_failed (BP.md §2.3). */
export const ORDER_STATUSES = [
  'created',
  'paid',
  'picked_up',
  'expired',
  'refunded',
  'payment_failed',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Бокс: published | sold_out | closed (видимые покупателю; BP.md §2.2). */
export const BOX_STATUSES = ['published', 'sold_out', 'closed'] as const;
export type BoxStatus = (typeof BOX_STATUSES)[number];

/** Жалоба (BP.md §2.4). */
export const COMPLAINT_STATUSES = ['open', 'resolved_refund', 'resolved_rejected'] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

/** Методы оплаты (C-10; по факту провайдера Freedom Pay). */
export const PAYMENT_METHODS = ['kaspi', 'card', 'apple_pay', 'google_pay'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Причины жалобы (C-16, чипы). */
export const COMPLAINT_REASONS = ['expired', 'quality', 'mismatch', 'other'] as const;
export type ComplaintReason = (typeof COMPLAINT_REASONS)[number];

/** Категории заведения (для фильтров и иконок). */
export const MERCHANT_CATEGORIES = [
  'bakery',
  'cafe',
  'restaurant',
  'grocery',
  'sushi',
  'coffee',
  'other',
] as const;
export type MerchantCategory = (typeof MERCHANT_CATEGORIES)[number];

/** Семантический вариант бейджа статуса (DESIGN.md §4.1). */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted';

/** Словарь: статус заказа → вариант бейджа. */
export const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  created: 'muted',
  paid: 'info',
  picked_up: 'success',
  expired: 'danger',
  refunded: 'warning',
  payment_failed: 'danger',
};

/** Словарь: статус бокса → вариант бейджа. */
export const BOX_STATUS_VARIANT: Record<BoxStatus, BadgeVariant> = {
  published: 'success',
  sold_out: 'muted',
  closed: 'muted',
};
