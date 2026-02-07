import { useQuery } from '@tanstack/react-query';
import { getDays } from '@/api/days';

export function useSeasonCalendar(year: number) {
  return useQuery({
    queryKey: ['seasonCalendar', year],
    queryFn: async () => {
      // Fetch all days for the season (large page size)
      const response = await getDays(year, { page: 1, size: 366 });
      return response.items;
    },
    staleTime: Infinity,
  });
}
