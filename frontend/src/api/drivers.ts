import { apiGet } from './client';
import type { DriverBrief, DriverDetail, DriverRaceResult } from '@/types';

export async function getDrivers(year: number): Promise<DriverBrief[]> {
  return apiGet<DriverBrief[]>(`/seasons/${year}/drivers`);
}

export async function getDriverDetail(
  driverRef: string,
  year?: number
): Promise<DriverDetail> {
  const params = year ? { season: year } : undefined;
  return apiGet<DriverDetail>(`/drivers/${driverRef}`, params);
}

export async function getDriverRaceResults(driverRef: string, year: number): Promise<DriverRaceResult[]> {
  return apiGet<DriverRaceResult[]>(`/drivers/${driverRef}/race-results`, { season: year });
}

// API object for pages that expect this pattern
// Note: getDriverDetails takes (year, driverRef) to match page calling convention
export const driversApi = {
  getSeasonDrivers: getDrivers,
  getDriverDetails: (year: number, driverRef: string) => getDriverDetail(driverRef, year),
  getDriverRaceResults,
};
