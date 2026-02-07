import { useQuery } from '@tanstack/react-query';
import { getRaces, getRaceDetail } from '@/api/races';
import { getRaceResults, getQualifying } from '@/api/results';
import { apiGet } from '@/api/client';

export function useRaces(year: number) {
  return useQuery({
    queryKey: ['races', year],
    queryFn: () => getRaces(year),
    staleTime: Infinity,
  });
}

export function useRace(year: number, round: number) {
  return useQuery({
    queryKey: ['race', year, round],
    queryFn: () => getRaceDetail(year, round),
    staleTime: Infinity,
  });
}

export function useRaceResults(year: number, round: number) {
  return useQuery({
    queryKey: ['raceResults', year, round],
    queryFn: () => getRaceResults(year, round),
    staleTime: Infinity,
  });
}

export function useQualifyingResults(year: number, round: number) {
  return useQuery({
    queryKey: ['qualifying', year, round],
    queryFn: () => getQualifying(year, round),
    staleTime: Infinity,
  });
}

export function useFastestLaps(year: number, round: number) {
  return useQuery({
    queryKey: ['fastestLaps', year, round],
    queryFn: () => apiGet(`/seasons/${year}/races/${round}/fastest-laps`),
    staleTime: Infinity,
  });
}
