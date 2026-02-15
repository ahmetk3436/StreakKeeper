export interface Snap {
  id: string;
  user_id: string;
  image_url: string;
  caption: string;
  filter: string;
  snap_date: string;
  like_count: number;
  created_at: string;
}

export interface SnapStreak {
  current_streak: number;
  longest_streak: number;
  total_snaps: number;
  last_snap_date: string;
  has_snapped_today: boolean;
  freezes_available: number;
  freezes_used: number;
}

export interface FreezeResponse {
  message: string;
  freezes_available: number;
  freezes_used: number;
  current_streak: number;
}

export interface SnapsListResponse {
  snaps: Snap[];
  total: number;
  page: number;
  limit: number;
}
