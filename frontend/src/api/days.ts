import { apiGet } from './client';
import type { DayDetail, DayNavigation, TodayResponse, DayBrief, PaginatedResponse } from '@/types';

export async function getDayDetail(year: number, date: string): Promise<DayDetail> {
  return apiGet<DayDetail>(`/seasons/${year}/days/${date}`);
}

export async function getDayNavigation(year: number, date: string): Promise<DayNavigation> {
  return apiGet<DayNavigation>(`/seasons/${year}/days/${date}/navigation`);
}

export async function getToday(year: number): Promise<TodayResponse> {
  return apiGet<TodayResponse>(`/seasons/${year}/today`);
}

export async function getDays(
  year: number,
  params?: {
    page?: number;
    size?: number;
    day_type?: string;
    has_sessions?: boolean;
    race_weekend?: string;
  }
): Promise<PaginatedResponse<DayBrief>> {
  return apiGet<PaginatedResponse<DayBrief>>(`/seasons/${year}/days`, params);
}
