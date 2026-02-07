export interface DriverStandingOut {
  driver_standing_id: number;
  race_id: number;
  driver_ref: string;
  driver_name: string;
  constructor_ref: string;
  constructor_name: string;
  points: number;
  position: number;
  position_text: string;
  wins: number;
}

export interface ConstructorStandingOut {
  constructor_standing_id: number;
  race_id: number;
  constructor_ref: string;
  constructor_name: string;
  points: number;
  position: number;
  position_text: string;
  wins: number;
}

export interface PointsAfterRound {
  round: number;
  points: number;
}

export interface StandingsProgressionOut {
  driver_ref: string;
  driver_name: string;
  constructor_ref: string;
  points_by_round: PointsAfterRound[];
}
