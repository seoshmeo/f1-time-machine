export type DayType = 'race' | 'qualifying' | 'practice' | 'testing' | 'off_season' | 'announcement';

export interface EventOut {
  event_id: number;
  date: string;
  event_type: string;
  importance: 'high' | 'medium' | 'low';
  title: string;
  summary: string;
  details?: string;
  related_driver_ref?: string;
  related_constructor_ref?: string;
  related_race_round?: number;
  source?: string;
  source_url?: string;
}

export interface SessionResultSummary {
  session_type: string;
  winner_name?: string;
  winner_time?: string;
  fastest_lap_driver?: string;
  fastest_lap_time?: string;
  pole_position_driver?: string;
  pole_position_time?: string;
}

export interface DayBrief {
  date: string;
  day_type: DayType;
  race_weekend?: string;
  race_round?: number;
  has_sessions: boolean;
  event_count: number;
  main_headline?: string;
}

export interface DayDetail {
  date: string;
  day_type: DayType;
  race_weekend?: string;
  race_round?: number;
  events: EventOut[];
  session_results: SessionResultSummary[];
  season_progress: {
    total_days: number;
    days_elapsed: number;
    races_completed: number;
    races_remaining: number;
  };
}

export interface DayNavigation {
  current_date: string;
  prev_date: string | null;
  next_date: string | null;
  is_season_start: boolean;
  is_season_end: boolean;
  jump_to_prev_race?: string;
  jump_to_next_race?: string;
}

export interface TodayResponse {
  today: string;
  years_ago: number;
  day_detail: DayDetail;
}
