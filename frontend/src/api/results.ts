import { apiGet } from './client';
import type { ResultOut, QualifyingResultOut } from '@/types';

export async function getRaceResults(year: number, round: number): Promise<ResultOut[]> {
  return apiGet<ResultOut[]>(`/seasons/${year}/races/${round}/results`);
}

export async function getQualifying(year: number, round: number): Promise<QualifyingResultOut[]> {
  return apiGet<QualifyingResultOut[]>(`/seasons/${year}/races/${round}/qualifying`);
}
