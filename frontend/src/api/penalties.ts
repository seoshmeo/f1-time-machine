import { apiGet } from './client';

export interface PenaltyOut {
  id: number;
  round: number;
  penalty_type: string;
  timing: string;
  penalty_value: string | null;
  reason: string;
  description: string | null;
  incident_time: string | null;
  driver_name: string | null;
  constructor_name: string | null;
  constructor_ref: string | null;
}

export async function getRacePenalties(year: number, round: number): Promise<PenaltyOut[]> {
  return apiGet<PenaltyOut[]>(`/seasons/${year}/races/${round}/penalties`);
}
