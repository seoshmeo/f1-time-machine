import { apiGet } from './client';

export interface H2HDriver {
  driver_ref: string;
  first_name: string;
  last_name: string;
  code: string;
}

export interface H2HComparison {
  driver1_ahead: number;
  driver2_ahead: number;
  total: number;
}

export interface H2HPoints {
  driver1_total: number;
  driver2_total: number;
  driver1_podiums: number;
  driver2_podiums: number;
  driver1_dnfs: number;
  driver2_dnfs: number;
}

export interface H2HProgressionEntry {
  round: number;
  driver1_points: number;
  driver2_points: number;
}

export interface H2HTeamData {
  constructor_ref: string;
  constructor_name: string;
  driver1: H2HDriver;
  driver2: H2HDriver;
  qualifying: H2HComparison;
  races: H2HComparison;
  fastest_laps: { driver1_count: number; driver2_count: number };
  points: H2HPoints;
  points_progression: H2HProgressionEntry[];
}

export function getHeadToHead(year: number): Promise<H2HTeamData[]> {
  return apiGet<H2HTeamData[]>(`/seasons/${year}/head-to-head`);
}
