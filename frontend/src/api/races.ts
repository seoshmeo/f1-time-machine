import { apiGet } from './client';
import type { RaceBrief, RaceDetail } from '@/types';

export async function getRaces(year: number): Promise<RaceBrief[]> {
  return apiGet<RaceBrief[]>(`/seasons/${year}/races`);
}

export async function getRaceDetail(year: number, round: number): Promise<RaceDetail> {
  return apiGet<RaceDetail>(`/seasons/${year}/races/${round}`);
}
