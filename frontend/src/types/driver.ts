export interface DriverBrief {
  id: number;
  driver_ref: string;
  number?: number;
  code?: string;
  first_name: string;
  last_name: string;
  nationality?: string;
  url?: string;
  photo_url?: string;
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

export interface DriverRaceResult {
  round: number;
  race_name: string;
  circuit_name: string;
  date: string;
  grid_position: number | null;
  position: number | null;
  position_text: string | null;
  points: number;
  laps_completed: number | null;
  finish_time: string | null;
  fastest_lap_time: string | null;
  fastest_lap_speed: number | null;
  fastest_lap_rank: number | null;
  status: string | null;
  qualifying_position: number | null;
}
