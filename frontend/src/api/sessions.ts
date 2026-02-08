import { apiGet } from './client';

export interface SessionResult {
  position: number;
  driver_name: string;
  constructor_name: string;
  constructor_ref: string;
  time?: string | null;
  points?: number;
  status?: string | null;
  grid?: number;
  laps?: number;
  q1_time?: string | null;
  q2_time?: string | null;
  q3_time?: string | null;
}

export async function getSessionResults(sessionId: number): Promise<SessionResult[]> {
  return apiGet<SessionResult[]>(`/sessions/${sessionId}/results`);
}
