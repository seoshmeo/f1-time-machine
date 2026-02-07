export interface CircuitOut {
  circuit_id?: string;
  circuit_ref?: string;
  name?: string;
  location?: string;
  country?: string;
  lat?: number;
  lng?: number;
  url?: string;
}

export interface SessionBrief {
  session_id?: number;
  session_type: string;
  date: string;
  time?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface RaceBrief {
  id: number;
  round: number;
  name: string;
  date: string;
  time?: string;
  circuit_name?: string;
  circuit_country?: string;
  winner_name?: string;
  pole_name?: string;
}

export interface RaceDetail extends RaceBrief {
  sessions?: SessionBrief[];
  url?: string;
  // Additional fields used by RacePage
  race_results?: any[];
  qualifying_results?: any[];
  practice_sessions?: any[][];
}

// Aliases for components that expect different names
export type Race = RaceBrief;
