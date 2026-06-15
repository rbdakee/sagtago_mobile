/** Статичные боксы для разработки UI. discountPct считается из price/value. */
import { discountPct, type Box } from '@/domain';

import { merchants } from './merchants';

const m = (id: string) => merchants.find((x) => x.id === id)!;
const photo = (seed: string) => `https://picsum.photos/seed/${seed}/600/450`;

type BoxSeed = Omit<Box, 'discountPct' | 'merchant'> & { merchantId: string };

const seeds: BoxSeed[] = [
  {
    id: 'b1',
    merchantId: 'm1',
    title: 'Пекарь-бокс',
    description: 'Ассорти свежей выпечки: круассаны, булочки, хлеб.',
    category: 'Выпечка',
    price: 990,
    value: 3200,
    pickupWindow: { from: '19:00', to: '21:00' },
    stockLeft: 4,
    status: 'published',
    photo: photo('sg-bakery'),
  },
  {
    id: 'b2',
    merchantId: 'm2',
    title: 'Кофейный сюрприз',
    description: 'Напиток дня + десерт на выбор бариста.',
    category: 'Кофе и десерт',
    price: 690,
    value: 2100,
    pickupWindow: { from: '18:30', to: '20:00' },
    stockLeft: 2,
    status: 'published',
    photo: photo('sg-coffee'),
  },
  {
    id: 'b3',
    merchantId: 'm3',
    title: 'Обед-бокс',
    description: 'Горячее блюдо дня, гарнир и салат.',
    category: 'Готовая еда',
    price: 1290,
    value: 3900,
    pickupWindow: { from: '20:00', to: '21:30' },
    stockLeft: 6,
    status: 'published',
    photo: photo('sg-lunch'),
  },
  {
    id: 'b4',
    merchantId: 'm4',
    title: 'Продуктовая корзина',
    description: 'Овощи, фрукты и молочка с коротким сроком.',
    category: 'Продукты',
    price: 1500,
    value: 4800,
    pickupWindow: { from: '21:00', to: '22:00' },
    stockLeft: 3,
    status: 'published',
    photo: photo('sg-grocery'),
  },
  {
    id: 'b5',
    merchantId: 'm5',
    title: 'Сет-сюрприз',
    description: 'Роллы и сашими дня от шефа.',
    category: 'Суши',
    price: 2490,
    value: 7500,
    pickupWindow: { from: '21:30', to: '22:30' },
    stockLeft: 0,
    status: 'sold_out',
    photo: photo('sg-sushi'),
  },
  {
    id: 'b6',
    merchantId: 'm6',
    title: 'Завтрак на двоих',
    description: 'Сэндвичи, выпечка и сок.',
    category: 'Завтрак',
    price: 1190,
    value: 3600,
    pickupWindow: { from: '09:00', to: '11:00' },
    stockLeft: 5,
    status: 'published',
    photo: photo('sg-breakfast'),
  },
  {
    id: 'b7',
    merchantId: 'm1',
    title: 'Вечерний хлеб',
    description: 'Хлеб и багеты на закрытии.',
    category: 'Выпечка',
    price: 590,
    value: 1800,
    pickupWindow: { from: '20:30', to: '21:00' },
    stockLeft: 1,
    status: 'published',
    photo: photo('sg-bread'),
  },
  {
    id: 'b8',
    merchantId: 'm3',
    title: 'Шеф-бокс',
    description: 'Премиальное блюдо дня в одном боксе.',
    category: 'Готовая еда',
    price: 1990,
    value: 6000,
    pickupWindow: { from: '19:00', to: '20:00' },
    stockLeft: 0,
    status: 'closed',
    photo: photo('sg-chef'),
  },
];

export const boxes: Box[] = seeds.map((s) => {
  const { merchantId, ...rest } = s;
  return {
    ...rest,
    merchant: m(merchantId),
    discountPct: discountPct(s.price, s.value),
  };
});

export const boxById = (id: string): Box | undefined => boxes.find((b) => b.id === id);
