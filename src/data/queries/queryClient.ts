import { QueryClient } from '@tanstack/react-query';

/** Общий QueryClient (создаётся один раз, передаётся в провайдер в app/_layout). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
