import { useQuery } from '@tanstack/react-query';
import { getDriverStandings, getConstructorStandings, getDriverProgression } from '@/api/standings';

export function useDriverStandings(year: number, afterRound?: number) {
  return useQuery({
    queryKey: ['driverStandings', year, afterRound],
    queryFn: () => getDriverStandings(year, afterRound),
    staleTime: Infinity,
  });
}

export function useConstructorStandings(year: number, afterRound?: number) {
  return useQuery({
    queryKey: ['constructorStandings', year, afterRound],
    queryFn: () => getConstructorStandings(year, afterRound),
    staleTime: Infinity,
  });
}

export function useDriverProgression(year: number) {
  return useQuery({
    queryKey: ['driverProgression', year],
    queryFn: () => getDriverProgression(year),
    staleTime: Infinity,
  });
}
