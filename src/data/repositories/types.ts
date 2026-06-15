/**
 * Интерфейсы репозиториев — граница между UI и источником данных (ARCHITECTURE §6).
 * Сейчас реализованы плейсхолдерами (data/placeholders). Когда бэкенд отдаст
 * контракт — добавим data/api с теми же интерфейсами и поменяем фабрику
 * (repositories/index.ts). Экраны и Query-хуки при этом не меняются.
 */
import type {
  Box,
  Complaint,
  MerchantCategory,
  Merchant,
  Order,
  PaymentMethod,
  Rating,
} from '@/domain';

export type BoxFilters = {
  categories?: MerchantCategory[];
  priceMax?: number;
  query?: string;
};

export interface BoxRepo {
  list(filters?: BoxFilters): Promise<Box[]>;
  byId(id: string): Promise<Box | null>;
}

export interface MerchantRepo {
  byId(id: string): Promise<Merchant | null>;
}

export type CreateOrderInput = {
  box: Box;
  qty: number;
  paymentMethod: PaymentMethod;
};

export interface OrderRepo {
  /** Создаёт заказ (→ paid в моке; в реале → created до подтверждения оплаты). */
  create(input: CreateOrderInput): Promise<Order>;
  byId(id: string): Promise<Order | null>;
  listActive(): Promise<Order[]>;
  listHistory(): Promise<Order[]>;
}

export interface FavoriteRepo {
  list(): Promise<Box[]>;
  ids(): Promise<string[]>;
  /** Переключает избранное, возвращает новое состояние (true = в избранном). */
  toggle(boxId: string): Promise<boolean>;
}

export interface RatingRepo {
  submit(rating: Rating): Promise<void>;
}

export type CreateComplaintInput = Omit<Complaint, 'id' | 'status'>;

export interface ComplaintRepo {
  submit(input: CreateComplaintInput): Promise<Complaint>;
}

export type Repositories = {
  boxes: BoxRepo;
  merchants: MerchantRepo;
  orders: OrderRepo;
  favorites: FavoriteRepo;
  ratings: RatingRepo;
  complaints: ComplaintRepo;
};
