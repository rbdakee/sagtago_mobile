/**
 * In-memory реализация репозиториев на статичных данных. Имитирует задержку
 * сети (чтобы экраны реально проходили состояние Loading) и держит мутабельное
 * состояние сессии (избранное, созданные заказы). Замена на data/api — в одной
 * точке (repositories/index.ts), экраны не трогаем.
 */
import type { Box, Complaint, Order } from '@/domain';
import { calcOrderSummary } from '@/domain';

import type {
  BoxFilters,
  ComplaintRepo,
  CreateComplaintInput,
  CreateOrderInput,
  FavoriteRepo,
  MerchantRepo,
  OrderRepo,
  RatingRepo,
  Repositories,
} from '../repositories/types';

import { boxes as allBoxes, boxById } from './boxes';
import { merchantById } from './merchants';
import { seedOrders } from './orders';

const delay = (ms = 450) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Мутабельное состояние «сессии» (живёт пока запущено приложение).
const favoriteIds = new Set<string>(['b2']);
const orders: Order[] = [...seedOrders];

const withFav = (box: Box): Box => ({ ...box, isFavorite: favoriteIds.has(box.id) });

let codeSeq = 0;
function genCode(): string {
  codeSeq += 1;
  return String(1000 + ((codeSeq * 1373) % 8999));
}

const HISTORY_STATUSES: Order['status'][] = ['picked_up', 'expired', 'refunded', 'payment_failed'];

const boxes = {
  async list(filters?: BoxFilters): Promise<Box[]> {
    await delay();
    let result = allBoxes.filter((b) => b.status !== 'closed');
    if (filters?.categories?.length) {
      result = result.filter((b) => filters.categories!.includes(b.merchant.category));
    }
    if (typeof filters?.priceMax === 'number') {
      result = result.filter((b) => b.price <= filters.priceMax!);
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim().toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.merchant.name.toLowerCase().includes(q),
      );
    }
    return result.map(withFav);
  },
  async byId(id: string): Promise<Box | null> {
    await delay();
    const box = boxById(id);
    return box ? withFav(box) : null;
  },
};

const merchants: MerchantRepo = {
  async byId(id) {
    await delay(200);
    return merchantById(id) ?? null;
  },
};

const ordersRepo: OrderRepo = {
  async create(input: CreateOrderInput): Promise<Order> {
    await delay(700);
    const { base, serviceFee, total } = calcOrderSummary(input.box.price, input.qty);
    const id = `o${orders.length + 1}-${genCode()}`;
    const code = genCode();
    const order: Order = {
      id,
      box: input.box,
      merchant: input.box.merchant,
      qty: input.qty,
      basePrice: base,
      serviceFee,
      total,
      status: 'paid', // мок пропускает реальную оплату; в реале — created → paid по вебхуку
      pickupCode: code,
      qrPayload: `SAQTAGO:${id}:${code}`,
      pickupWindow: input.box.pickupWindow,
      paymentMethod: input.paymentMethod,
      createdAt: '2026-06-15T17:00:00+05:00',
    };
    orders.unshift(order);
    return order;
  },
  async byId(id) {
    await delay(250);
    return orders.find((o) => o.id === id) ?? null;
  },
  async listActive() {
    await delay();
    return orders.filter((o) => o.status === 'paid');
  },
  async listHistory() {
    await delay();
    return orders.filter((o) => HISTORY_STATUSES.includes(o.status));
  },
};

const favorites: FavoriteRepo = {
  async list() {
    await delay();
    return allBoxes.filter((b) => favoriteIds.has(b.id)).map(withFav);
  },
  async ids() {
    await delay(120);
    return [...favoriteIds];
  },
  async toggle(boxId: string) {
    await delay(120);
    if (favoriteIds.has(boxId)) {
      favoriteIds.delete(boxId);
      return false;
    }
    favoriteIds.add(boxId);
    return true;
  },
};

const ratings: RatingRepo = {
  async submit() {
    await delay(500);
  },
};

const complaints: ComplaintRepo = {
  async submit(input: CreateComplaintInput): Promise<Complaint> {
    await delay(600);
    return { ...input, id: `c-${genCode()}`, status: 'open' };
  },
};

export const placeholderRepositories: Repositories = {
  boxes,
  merchants,
  orders: ordersRepo,
  favorites,
  ratings,
  complaints,
};
