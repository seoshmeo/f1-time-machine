import { apiGet } from './client';
import type { ResultOut, QualifyingResultOut } from '@/types';

export async function getRaceResults(year: number, round: number): Promise<ResultOut[]> {
  return apiGet<ResultOut[]>(`/seasons/${year}/races/${round}/results`);
}

export async function getQualifying(year: number, round: number): Promise<QualifyingResultOut[]> {
  return apiGet<QualifyingResultOut[]>(`/seasons/${year}/races/${round}/qualifying`);
}

export interface LapDriverInfo {
  driver_id: string;
  name: string;
  constructor_ref: string;
  abbreviation: string;
}

export interface LapPositionsData {
  drivers: LapDriverInfo[];
  laps: Record<string, number | string>[];
}

export async function getLapPositions(year: number, round: number): Promise<LapPositionsData> {
  return apiGet<LapPositionsData>(`/seasons/${year}/races/${round}/lap-positions`);
}
