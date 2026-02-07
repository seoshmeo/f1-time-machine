export interface CircuitOut {
  circuit_id: string;
  circuit_ref: string;
  name: string;
  location: string;
  country: string;
  lat?: number;
  lng?: number;
  url?: string;
}

export interface SessionBrief {
  session_id: number;
  session_type: string;
  date: string;
  time?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface RaceBrief {
  race_id: number;
  year: number;
  round: number;
  name: string;
  date: string;
  time?: string;
  circuit: CircuitOut;
  status: 'scheduled' | 'completed' | 'cancelled';
  winner_name?: string;
  pole_name?: string;
}

export interface RaceDetail extends RaceBrief {
  sessions: SessionBrief[];
  url?: string;
}
