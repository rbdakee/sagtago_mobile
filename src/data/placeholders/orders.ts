/** Сид-заказы (активный + история) для экранов «Заказы» до API. */
import { calcOrderSummary, type Order, type OrderStatus, type PaymentMethod } from '@/domain';

import { boxById } from './boxes';

type OrderSeed = {
  id: string;
  boxId: string;
  qty: number;
  status: OrderStatus;
  pickupCode: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

function buildOrder(seed: OrderSeed): Order {
  const box = boxById(seed.boxId)!;
  const { base, serviceFee, total } = calcOrderSummary(box.price, seed.qty);
  return {
    id: seed.id,
    box,
    merchant: box.merchant,
    qty: seed.qty,
    basePrice: base,
    serviceFee,
    total,
    status: seed.status,
    pickupCode: seed.pickupCode,
    qrPayload: `SAQTAGO:${seed.id}:${seed.pickupCode}`,
    pickupWindow: box.pickupWindow,
    paymentMethod: seed.paymentMethod,
    createdAt: seed.createdAt,
  };
}

const seeds: OrderSeed[] = [
  { id: 'o1', boxId: 'b1', qty: 1, status: 'paid', pickupCode: '4827', paymentMethod: 'kaspi', createdAt: '2026-06-15T16:10:00+05:00' },
  { id: 'o2', boxId: 'b3', qty: 1, status: 'picked_up', pickupCode: '1903', paymentMethod: 'card', createdAt: '2026-06-12T20:15:00+05:00' },
  { id: 'o3', boxId: 'b2', qty: 2, status: 'expired', pickupCode: '7720', paymentMethod: 'kaspi', createdAt: '2026-06-08T18:40:00+05:00' },
  { id: 'o4', boxId: 'b6', qty: 1, status: 'refunded', pickupCode: '5561', paymentMethod: 'apple_pay', createdAt: '2026-06-03T09:30:00+05:00' },
];

export const seedOrders: Order[] = seeds.map(buildOrder);
