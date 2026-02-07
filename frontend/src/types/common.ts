export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  status?: number;
}

export interface SeasonInfo {
  year: number;
  start_date: string;
  end_date: string;
  total_races: number;
}
