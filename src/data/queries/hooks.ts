/**
 * Query/Mutation хуки поверх репозиториев. ФУНДАМЕНТ-ФАЙЛ — покрывает все экраны;
 * агенты его НЕ редактируют, только импортируют нужный хук. Каждый data-экран
 * получает отсюда loading/error/data и сам рисует 4 состояния.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Rating } from '@/domain';

import { getRepositories } from '../repositories';
import type { BoxFilters, CreateComplaintInput, CreateOrderInput } from '../repositories/types';

import { qk } from './keys';

const repo = getRepositories();

// ---- Боксы ----
export function useBoxes(filters?: BoxFilters) {
  return useQuery({ queryKey: qk.boxes(filters), queryFn: () => repo.boxes.list(filters) });
}

export function useBox(id: string) {
  return useQuery({ queryKey: qk.box(id), queryFn: () => repo.boxes.byId(id), enabled: !!id });
}

// ---- Избранное ----
export function useFavorites() {
  return useQuery({ queryKey: qk.favorites(), queryFn: () => repo.favorites.list() });
}

export function useFavoriteIds() {
  return useQuery({ queryKey: qk.favoriteIds(), queryFn: () => repo.favorites.ids() });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boxId: string) => repo.favorites.toggle(boxId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['boxes'] });
      qc.invalidateQueries({ queryKey: ['box'] });
    },
  });
}

// ---- Заказы ----
export function useActiveOrders() {
  return useQuery({ queryKey: qk.ordersActive(), queryFn: () => repo.orders.listActive() });
}

export function useOrderHistory() {
  return useQuery({ queryKey: qk.ordersHistory(), queryFn: () => repo.orders.listHistory() });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: qk.order(id), queryFn: () => repo.orders.byId(id), enabled: !!id });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => repo.orders.create(input),
    onSuccess: (order) => {
      qc.setQueryData(qk.order(order.id), order);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ---- Оценка / жалоба ----
export function useSubmitRating() {
  return useMutation({ mutationFn: (rating: Rating) => repo.ratings.submit(rating) });
}

export function useSubmitComplaint() {
  return useMutation({
    mutationFn: (input: CreateComplaintInput) => repo.complaints.submit(input),
  });
}
