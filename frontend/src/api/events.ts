import { apiGet } from './client';

export interface SeasonEvent {
  id: number;
  type: string;
  title: string;
  summary: string | null;
  detail: string | null;
  importance: number;
  source_url: string | null;
  session_id: number | null;
  driver_ids: number[];
  tag_names: string[];
}

export async function getSeasonEvents(
  year: number,
  params?: { type?: string; tag?: string }
): Promise<SeasonEvent[]> {
  return apiGet<SeasonEvent[]>(`/seasons/${year}/events`, params);
}
