export interface PingUrl {
  id: string;
  url: string;
  duration: number;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  client_id: string;
  last_ping_at?: string;
  last_ping_status?: number;
  ping_count: number;
}

export interface AddUrlRequest {
  client_id: string;
  url: string;
  duration: number;
}