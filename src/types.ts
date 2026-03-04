export interface IpInfoResponse {
  ip: string;
  success: boolean;
  type?: string;
  continent?: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  org?: string;
  asn?: string;
  timezone?: string;
  currency?: string;
  latitude?: number;
  longitude?: number;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}