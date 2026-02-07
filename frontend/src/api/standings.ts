import { apiGet } from './client';
import type { DriverStandingOut, ConstructorStandingOut, StandingsProgressionOut } from '@/types';

export async function getDriverStandings(
  year: number,
  afterRound?: number
): Promise<DriverStandingOut[]> {
  const params = afterRound !== undefined ? { after_round: afterRound } : undefined;
  return apiGet<DriverStandingOut[]>(`/seasons/${year}/standings/drivers`, params);
}

export async function getConstructorStandings(
  year: number,
  afterRound?: number
): Promise<ConstructorStandingOut[]> {
  const params = afterRound !== undefined ? { after_round: afterRound } : undefined;
  return apiGet<ConstructorStandingOut[]>(`/seasons/${year}/standings/constructors`, params);
}

export async function getDriverProgression(year: number): Promise<StandingsProgressionOut[]> {
  return apiGet<StandingsProgressionOut[]>(`/seasons/${year}/standings/drivers/progression`);
}
