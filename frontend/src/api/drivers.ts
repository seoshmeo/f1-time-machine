import { apiGet } from './client';
import type { DriverBrief, DriverDetail } from '@/types';

export async function getDrivers(year: number): Promise<DriverBrief[]> {
  return apiGet<DriverBrief[]>(`/seasons/${year}/drivers`);
}

export async function getDriverDetail(
  driverRef: string,
  year?: number
): Promise<DriverDetail> {
  const endpoint = year
    ? `/seasons/${year}/drivers/${driverRef}`
    : `/drivers/${driverRef}`;
  return apiGet<DriverDetail>(endpoint);
}
