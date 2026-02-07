export interface DriverBrief {
  driver_id: number;
  driver_ref: string;
  number?: number;
  code?: string;
  forename: string;
  surname: string;
  dob?: string;
  nationality?: string;
  url?: string;
}

export interface DriverSeasonStats {
  year: number;
  constructor_ref: string;
  constructor_name: string;
  races: number;
  wins: number;
  podiums: number;
  poles: number;
  fastest_laps: number;
  points: number;
  final_position?: number;
}

export interface DriverDetail extends DriverBrief {
  season_stats?: DriverSeasonStats;
}
