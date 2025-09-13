export interface LogEntry {
  timestamp: string | null;
  level: string;
  message: string;
  raw: string;
}

export interface LogData {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
  source: string;
  error?: string;
}

export interface LogResponse {
  success: boolean;
  data: LogData;
}

export interface LogStats {
  exists: boolean;
  size?: number;
  lastModified?: Date;
  lines?: number;
}

export interface LogStatsResponse {
  success: boolean;
  data: {
    [key: string]: LogStats;
  };
}

export type LogType = 'error' | 'out' | 'combined'; 