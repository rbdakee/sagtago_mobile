/**
 * Доменные типы (из BP.md / ARCHITECTURE §5). Транспорт-независимы — описывают
 * сущности, которые видит покупатель. Деньги — целые ₸. Время окна — 'HH:mm'.
 */
import type {
  BoxStatus,
  ComplaintReason,
  ComplaintStatus,
  MerchantCategory,
  OrderStatus,
  PaymentMethod,
} from './enums';

export type Geo = { lat: number; lng: number };

/** Окно самовывоза, локальное время 'HH:mm' (например 20:00–21:30). */
export type PickupWindow = { from: string; to: string };

export type User = { id: string; phone: string; name?: string };

export type Merchant = {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  ratingCount: number;
  category: MerchantCategory;
  address: string;
  geo: Geo;
  /** Дистанция до пользователя, метры. */
  distanceM: number;
};

export type Box = {
  id: string;
  merchant: Merchant;
  title: string;
  description: string;
  /** Категория содержимого («сюрприз»). */
  category: string;
  /** Цена к оплате, ₸. */
  price: number;
  /** Исходная ценность (зачёркнутая), ₸. */
  value: number;
  /** Скидка, 0..100. */
  discountPct: number;
  pickupWindow: PickupWindow;
  stockLeft: number;
  status: BoxStatus;
  /** URI фото 4:3. */
  photo: string;
  isFavorite?: boolean;
};

export type Order = {
  id: string;
  box: Box;
  merchant: Merchant;
  qty: number;
  /** price * qty. */
  basePrice: number;
  /** Сервисный сбор 3% (R1). */
  serviceFee: number;
  /** basePrice + serviceFee. */
  total: number;
  status: OrderStatus;
  /** Код выдачи (показывается на C-12). */
  pickupCode: string;
  /** Полезная нагрузка QR. */
  qrPayload: string;
  pickupWindow: PickupWindow;
  paymentMethod: PaymentMethod;
  /** ISO-дата создания. */
  createdAt: string;
};

export type Complaint = {
  id: string;
  orderId: string;
  reason: ComplaintReason;
  /** ≥1 — фото обязательно (R4). */
  photos: string[];
  description: string;
  status: ComplaintStatus;
};

export type Rating = {
  orderId: string;
  /** 1..5. */
  stars: number;
  text?: string;
  photos?: string[];
};
