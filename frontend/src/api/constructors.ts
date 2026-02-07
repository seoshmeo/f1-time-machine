import { apiGet } from '@/api/client';

export interface ConstructorBrief {
  id: number;
  constructor_ref: string;
  name: string;
  nationality: string;
  url: string | null;
  color_primary: string | null;
  color_secondary: string | null;
}

interface ConstructorDriverOut {
  driver_ref: string;
  code: string | null;
  first_name: string;
  last_name: string;
  car_number: number | null;
}

interface ConstructorRaceDriverResult {
  driver_code: string | null;
  position: number | null;
  points: number;
}

interface ConstructorRaceResult {
  round: number;
  race_name: string;
  driver_results: ConstructorRaceDriverResult[];
}

interface ConstructorSeasonStats {
  races: number;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  final_position: number | null;
  fastest_laps: number;
  drivers: ConstructorDriverOut[];
  chassis: string | null;
  engine: string | null;
  race_results: ConstructorRaceResult[];
}

export interface ConstructorDetail extends ConstructorBrief {
  full_name: string | null;
  season_stats: ConstructorSeasonStats | null;
}

export async function getConstructors(year: number): Promise<ConstructorBrief[]> {
  return apiGet<ConstructorBrief[]>(`/seasons/${year}/constructors`);
}

export async function getConstructorDetail(constructorRef: string, year?: number): Promise<ConstructorDetail> {
  const params = year ? { season: year } : undefined;
  return apiGet<ConstructorDetail>(`/constructors/${constructorRef}`, params);
}
