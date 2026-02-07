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

// Combined hook for pages that need both driver and constructor standings
export function useStandings(year: number, afterRound?: number) {
  const driverStandings = useDriverStandings(year, afterRound);
  const constructorStandings = useConstructorStandings(year, afterRound);
  const driverProgression = useDriverProgression(year);

  return {
    data: {
      driver_standings: driverStandings.data,
      constructor_standings: constructorStandings.data,
      points_progression: driverProgression.data,
    },
    isLoading: driverStandings.isLoading || constructorStandings.isLoading || driverProgression.isLoading,
    error: driverStandings.error || constructorStandings.error || driverProgression.error,
  };
}
