# ARCHITECTURE — SaqtaGo Mobile (клиент)

> Как устроено клиентское приложение: стек, слои, структура папок, ключевые архитектурные
> решения. Источники правды: продукт/логика — [BP.md](BP.md), дизайн — [DESIGN.md](DESIGN.md)
> и хендофф `mobile_design/sg/project/`.

---

## 1. Принципы

1. **Token-driven.** Весь визуал выводится из дизайн-токенов. Компонент не знает HEX-ов —
   он знает имена токенов. Смена темы = смена значений токенов.
2. **Слои изолированы.** UI не ходит в сеть напрямую; данные — через слой репозиториев.
   Бизнес-правила и типы живут в `domain/` и не зависят от React.
3. **Транспорт сменный.** Пока нет API — за репозиториями статичные плейсхолдеры; когда
   будет контракт, меняется только реализация репозитория, экраны не трогаем.
4. **Каждый data-экран = 4 состояния** (Content / Loading / Empty / Error). Это часть контракта компонента, а не «потом».
5. **i18n с первого дня.** Нет строк в JSX — только ключи перевода.

---

## 2. Стек и обоснование

| Слой | Выбор | Почему |
|---|---|---|
| Платформа | Expo (managed) + RN + TypeScript | Скорость, OTA, EAS, dev build |
| Навигация | expo-router (file-based) | Карта экранов C-01…C-17 ложится в файловые маршруты 1:1, типобезопасные ссылки |
| Стили | theme-object + StyleSheet + `useTheme()` | Бесшовный порт токенов, свет/тьма свапом, ноль зависимостей, полный контроль над беспоск-компонентами дизайна |
| Glass | expo-blur (`BlurView`) + полупрозрачная заливка + верхний блик | Liquid Glass из дизайна; `tint` переключается по теме |
| Server-state | TanStack Query | Кэш + из коробки Loading/Empty/Error/refetch, что прямо мапится на состояния экранов |
| Local/UI/auth-state | Zustand | Лёгкий стор для сессии, темы, фильтров |
| Формы | react-hook-form + zod | Валидация телефона/OTP/жалобы, одна схема на форму |
| i18n | i18next + expo-localization | RU/KK, namespaces, плюрализация чисел/валюты |
| Секреты | expo-secure-store | Токены сессии (Keychain/Keystore) |
| Пуши | expo-notifications | Напоминания о выдаче, «бокс рядом» |
| Шрифты | @expo-google-fonts (Unbounded, Onest) | Бренд-типографика из DESIGN.md §2.4 |
| Сборка | EAS dev build | Нативные модули (blur, secure-store, push, будущая карта) |

Дополнительно: `expo-image` (кэш фото боксов), `react-native-svg` (иконки line-стиля),
`@react-native-async-storage/async-storage` (необязательно — кэш Query / выбор темы/языка).

---

## 3. Структура папок

```
mobile_app/
  app/                        # expo-router маршруты (только роутинг + композиция экранов)
    _layout.tsx               # корневой layout: провайдеры (Theme, Query, i18n, Safe area)
    index.tsx                 # Splash → редирект по сессии (C-01)
    (auth)/
      onboarding.tsx          # C-02
      phone.tsx               # C-03
      otp.tsx                 # C-04
      permissions.tsx         # C-05
    (tabs)/
      _layout.tsx             # GlassTabBar (4 таба)
      index.tsx               # C-06 Главная (список; карта — отдельный stub-экран)
      orders.tsx              # C-13
      favorites.tsx           # Избранное
      profile.tsx             # C-17 (+ язык RU/KK, + тема)
    box/[id].tsx              # C-08 карточка бокса
    booking/[boxId].tsx       # C-09 бронь + сбор 3%
    payment/[orderId].tsx     # C-10 оплата
    success/[orderId].tsx     # C-11
    order/[id].tsx            # C-12 активный заказ (код/QR) / C-14 детали
    rating/[orderId].tsx      # C-15
    complaint/[orderId].tsx   # C-16 жалоба + фото

  src/
    theme/                    # tokens.ts, themes/{graphite,graphiteDark}.ts, ThemeProvider, useTheme, typography, spacing
    components/
      ui/                     # примитивы: Button, Input, OTPInput, Chip, Badge, Discount,
                              #            RatingStars, Stepper, Toast, Divider, ListCard
      domain/                 # BoxCard, MerchantHeader, OrderRow, CodeCard/QRCard, Marker, StatCard, TrustBlock
      glass/                  # GlassNavBar, GlassTabBar, GlassBottomSheet, GlassFab
      states/                 # Loading (скелетоны), Empty, ErrorState
    domain/                   # types.ts (User, Merchant, Box, Order, Complaint, Rating),
                              # enums.ts (статусы), schemas.ts (zod), rules.ts (R1–R7, расчёт сбора)
    data/
      repositories/           # интерфейсы: BoxRepo, OrderRepo, MerchantRepo, AuthRepo, ComplaintRepo, FavoriteRepo
      placeholders/           # статичные данные для разработки UI (до API)
      api/                    # (позже) http-клиент + реализации репозиториев по контракту
      queries/                # TanStack Query хуки (useBoxes, useOrder, ...)
    store/                    # zustand: sessionStore, prefsStore (тема/язык)
    i18n/                     # index.ts, locales/ru.json, locales/kk.json
    lib/                      # formatMoney, formatWindow, deeplink2gis, time utils
    config/                   # env.ts, app constants (сбор 3%, hold-таймаут, и т.п.)
    hooks/                    # useColorSchemePref, useSession, ...

  assets/                     # fonts/, images/, icons/, app-icon, splash
  docs/                       # эта документация + mobile_design/ (хендофф)
```

Правило: в `app/` — только роутинг и сборка экрана из компонентов/хуков. Вся логика — в `src/`.

---

## 4. Темизация

Поток: `tokens.css` → `src/theme/tokens.ts` (примитивы) → `themes/graphite.ts` и
`themes/graphiteDark.ts` (семантические токены) → `ThemeProvider` → `useTheme()`.

- `useTheme()` отдаёт активный объект темы (`colors`, `spacing`, `radii`, `shadows`, `typography`, `glass`).
- Активная тема = `prefsStore.themeMode` (`system | light | dark`); при `system` берём
  `useColorScheme()`. Выбор персистится (async-storage).
- **Dark Liquid Glass:** `BlurView tint` = `light`/`dark` по активной теме (в токенах CSS
  `--glass-tint` для тёмной не переопределён — в RN задаём tint явно, не наследуем белый).
- Семантические статус-цвета (success/warning/danger/info) одинаковы в обеих темах —
  узнаваемость бейджей (DESIGN.md §4.1).

Контраст: white-on-accent (`#349357`) ≈ 3.85:1 — ок только для крупного/жирного (кнопки),
для мелкого текста на акценте не используем. Проверять при добавлении новых поверхностей.

---

## 5. Доменная модель (из BP.md)

Клиенту нужны (read/select, кроме заказа/жалобы/оценки/избранного — create):

```ts
type OrderStatus = 'created' | 'paid' | 'picked_up' | 'expired' | 'refunded' | 'payment_failed';
type BoxStatus   = 'published' | 'sold_out' | 'closed';
type ComplaintStatus = 'open' | 'resolved_refund' | 'resolved_rejected';

Merchant { id, name, logo?, rating, ratingCount, category, address, geo, distanceM }
Box      { id, merchant, title, description, category, price, value, discountPct,
           pickupWindow {from,to}, stockLeft, status, photo }
Order    { id, box, merchant, qty, basePrice, serviceFee, total, status,
           pickupCode, qrPayload, pickupWindow, paymentMethod, createdAt }
Complaint{ id, orderId, reason, photos[], description, status }
Rating   { orderId, stars, text?, photos? }
```

Бизнес-правила и расчёты (сбор 3%, проверка «цена ≤ ⅓ ценности» для отображения скидки,
проверка окна) — в `domain/rules.ts`, как чистые функции, покрытые тестами.

---

## 6. Слой данных (репозитории)

```ts
interface BoxRepo {
  list(filters): Promise<Box[]>;
  byId(id): Promise<Box>;
}
interface OrderRepo {
  create(boxId, qty, paymentMethod): Promise<Order>;   // → created
  byId(id): Promise<Order>;
  listActive(): Promise<Order[]>;
  listHistory(): Promise<Order[]>;
}
// AuthRepo, MerchantRepo, ComplaintRepo, FavoriteRepo — аналогично
```

- Сейчас: реализации в `data/placeholders/` (статичные данные из прототипа).
- Позже: `data/api/` с http-клиентом по контракту бэкенда; точка подмены — DI/фабрика
  репозиториев. Экраны и Query-хуки не меняются.
- TanStack Query поверх репозиториев: ключи кэша, `staleTime`, инвалидация после брони/жалобы.

---

## 7. Навигация и сессия

- Splash (`index.tsx`) бутстрапит сессию из secure-store → редирект в `(tabs)` или `(auth)`.
- Guard: защищённые маршруты проверяют сессию; без неё → `(auth)/phone`.
- Глубокие переходы по карте экранов из DESIGN.md §5.1.

**Auth:** телефон → OTP (отправляет бэкенд: WhatsApp + fallback SMS; клиент только вводит код)
→ токен в secure-store → запрос разрешений (гео/пуш) → Главная.

---

## 8. Платёж (Freedom Pay)

1. На брони клиент выбирает количество и метод; экран суммы показывает сбор 3% (R1, прозрачно).
2. `OrderRepo.create` → `Order(created)`; бэкенд создаёт платёжную сессию провайдера.
3. App открывает страницу/виджет провайдера (in-app browser / SDK). Карта не касается app.
4. Подтверждение — вебхуком на бэкенд (сплит исполняется там, R5). Клиент дожидается статуса
   (`paid`) через refetch/пуш → экран успеха + код выдачи.
5. Краевые: `payment_failed` (остаток возвращён), таймаут hold. MVP — провайдер застаблен.

> Откат частичного сплита при возврате — открытый вопрос бэкенда (BP.md §6). Клиента не блокирует.

---

## 9. Карта (C-06)

- v1: главный экран — **список** (приоритет). Экран «карта» — заглушка/плейсхолдер.
- Кнопка «Открыть в 2GIS» — deep-link по URL-схеме, работает **независимо** от выбранного
  map-SDK. Выбор SDK (2GIS/Mapbox) откладываем до этапа карты.

---

## 10. i18n, форматирование, доступность

- Namespaces по фичам; RU — дефолт и фолбэк, KK — обязателен (заполняем по мере готовности UI).
- `formatMoney` → `1 030 ₸`; `formatWindow` → `20:00–21:30`. Числа/валюта — по локали.
- A11y: контраст ≥ 4.5:1 (текст) / ≥ 3:1 (крупное/иконки); тач-таргеты ≥ 44; поддержка
  увеличенного системного шрифта; гибкие контейнеры под длинные KK-строки.

---

## 11. Конфиг и окружение

- `src/config/env.ts` — типобезопасный доступ к env (base URL API, ключи провайдеров) через
  `expo-constants` / `app.config.ts` + `.env` (не коммитим секреты).
- Бизнес-константы (`SERVICE_FEE_PCT = 0.03`, hold-таймаут, тайминг пуш-напоминания) — в одном месте.

---

## 12. Тестирование

- Jest + React Native Testing Library — лёгкий каркас (без гонки за покрытием в MVP).
- Обязательно покрываем: `domain/rules.ts` (расчёт сбора, скидки, проверка окна),
  `lib/format*`, критичные компоненты (BoxCard, StatusBadge) в обеих темах.

---

## 13. Качество кода

- ESLint + Prettier + strict TypeScript.
- Компоненты — функциональные, маленькие, переиспользуемые (никаких одноразовых стилей вне токенов).
- Именование файлов: компоненты `PascalCase.tsx`, хуки `useXxx.ts`, утилиты `camelCase.ts`.
