import { apiGet } from './client';

export interface TestingResult {
  position: number;
  driver_name: string;
  driver_ref: string;
  constructor_name: string;
  constructor_ref: string;
  color_primary: string | null;
  time: string | null;
  laps: number | null;
}

export interface TestingDay {
  session_id: number;
  name: string;
  date: string;
  results: TestingResult[];
}

export async function getTestingSessions(year: number): Promise<TestingDay[]> {
  return apiGet<TestingDay[]>(`/seasons/${year}/testing`);
}
