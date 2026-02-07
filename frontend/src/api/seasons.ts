import { apiGet } from './client';
import type { SeasonInfo } from '@/types/common';

export async function getSeasons(): Promise<SeasonInfo[]> {
  return apiGet<SeasonInfo[]>('/seasons');
}

export async function getSeasonInfo(year: number): Promise<SeasonInfo> {
  return apiGet<SeasonInfo>(`/seasons/${year}`);
}
