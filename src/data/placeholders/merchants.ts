/** Статичные заведения для разработки UI (до API). Гео — Алматы. */
import type { Merchant } from '@/domain';

export const merchants: Merchant[] = [
  {
    id: 'm1',
    name: 'Тёплый хлеб',
    rating: 4.8,
    ratingCount: 312,
    category: 'bakery',
    address: 'пр. Абая, 42',
    geo: { lat: 43.2405, lng: 76.9156 },
    distanceM: 320,
  },
  {
    id: 'm2',
    name: 'Кофе на Панфилова',
    rating: 4.6,
    ratingCount: 188,
    category: 'coffee',
    address: 'ул. Панфилова, 110',
    geo: { lat: 43.2585, lng: 76.9447 },
    distanceM: 850,
  },
  {
    id: 'm3',
    name: 'Дастархан',
    rating: 4.7,
    ratingCount: 521,
    category: 'restaurant',
    address: 'ул. Сатпаева, 90',
    geo: { lat: 43.2389, lng: 76.9302 },
    distanceM: 1240,
  },
  {
    id: 'm4',
    name: 'Свежесть 24',
    rating: 4.4,
    ratingCount: 97,
    category: 'grocery',
    address: 'мкр. Самал-2, 33',
    geo: { lat: 43.2331, lng: 76.9558 },
    distanceM: 1700,
  },
  {
    id: 'm5',
    name: 'Sushi Lab',
    rating: 4.9,
    ratingCount: 256,
    category: 'sushi',
    address: 'ул. Жандосова, 58',
    geo: { lat: 43.2197, lng: 76.8895 },
    distanceM: 2100,
  },
  {
    id: 'm6',
    name: 'Утро Cafe',
    rating: 4.5,
    ratingCount: 143,
    category: 'cafe',
    address: 'пр. Достык, 89',
    geo: { lat: 43.2412, lng: 76.9561 },
    distanceM: 640,
  },
];

export const merchantById = (id: string): Merchant | undefined =>
  merchants.find((m) => m.id === id);
