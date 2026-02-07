import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDayDetail, getDayNavigation } from '@/api/days';
import type { DayDetail, DayNavigation } from '@/types';

export function useDay(year: number, date: string) {
  return useQuery({
    queryKey: ['day', year, date],
    queryFn: () => getDayDetail(year, date),
    staleTime: Infinity,
  });
}

export function useDayNavigation(year: number, date: string) {
  return useQuery({
    queryKey: ['dayNavigation', year, date],
    queryFn: () => getDayNavigation(year, date),
    staleTime: Infinity,
  });
}

export function usePrefetchAdjacentDays(year: number, date: string) {
  const queryClient = useQueryClient();
  const { data: navigation } = useDayNavigation(year, date);

  // Prefetch previous day
  if (navigation?.prev_date) {
    queryClient.prefetchQuery({
      queryKey: ['day', year, navigation.prev_date],
      queryFn: () => getDayDetail(year, navigation.prev_date!),
      staleTime: Infinity,
    });

    queryClient.prefetchQuery({
      queryKey: ['dayNavigation', year, navigation.prev_date],
      queryFn: () => getDayNavigation(year, navigation.prev_date!),
      staleTime: Infinity,
    });
  }

  // Prefetch next day
  if (navigation?.next_date) {
    queryClient.prefetchQuery({
      queryKey: ['day', year, navigation.next_date],
      queryFn: () => getDayDetail(year, navigation.next_date!),
      staleTime: Infinity,
    });

    queryClient.prefetchQuery({
      queryKey: ['dayNavigation', year, navigation.next_date],
      queryFn: () => getDayNavigation(year, navigation.next_date!),
      staleTime: Infinity,
    });
  }
}
