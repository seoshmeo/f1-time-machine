export interface ResultOut {
  result_id: number;
  race_id: number;
  driver_ref: string;
  driver_name: string;
  constructor_ref: string;
  constructor_name: string;
  number?: number;
  grid: number;
  position?: number;
  position_text: string;
  position_order: number;
  points: number;
  laps: number;
  time?: string;
  milliseconds?: number;
  fastest_lap?: number;
  rank?: number;
  fastest_lap_time?: string;
  fastest_lap_speed?: string;
  status: string;
}

export interface QualifyingResultOut {
  qualifying_id: number;
  race_id: number;
  driver_ref: string;
  driver_name: string;
  constructor_ref: string;
  constructor_name: string;
  number?: number;
  position: number;
  q1?: string;
  q2?: string;
  q3?: string;
}

// Remove duplicate SessionResultSummary (it's already defined in day.ts)
// export interface SessionResultSummary {
//   session_type: string;
//   winner_name?: string;
//   winner_time?: string;
//   fastest_lap_driver?: string;
//   fastest_lap_time?: string;
//   pole_position_driver?: string;
//   pole_position_time?: string;
// }

// Aliases for components that expect different names
export type RaceResult = ResultOut;
export type QualifyingResult = QualifyingResultOut;
