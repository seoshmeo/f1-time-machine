import type { DriverBrief, ConstructorBrief } from './index';

export interface DriverStandingOut {
  position: number;
  driver: DriverBrief;
  constructor_name: string;
  points: number;
  wins: number;
}

export interface ConstructorStandingOut {
  position: number;
  constructor: ConstructorBrief;
  points: number;
  wins: number;
}

export interface PointsAfterRound {
  round: number;
  points: number;
}

export interface StandingsProgressionOut {
  driver_ref: string;
  driver_name?: string;
  constructor_ref?: string;
  points_by_round: PointsAfterRound[];
}

// Aliases for components that expect different names
export type DriverStanding = DriverStandingOut;
export type ConstructorStanding = ConstructorStandingOut;
