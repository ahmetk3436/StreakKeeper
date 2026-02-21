package dto

import "time"

type CreateSnapRequest struct {
	ImageURL string `json:"image_url"`
	Caption  string `json:"caption"`
	Filter   string `json:"filter"`
}

type SnapResponse struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	ImageURL  string    `json:"image_url"`
	Caption   string    `json:"caption"`
	Filter    string    `json:"filter"`
	SnapDate  time.Time `json:"snap_date"`
	LikeCount int       `json:"like_count"`
	CreatedAt time.Time `json:"created_at"`
}

type StreakResponse struct {
	CurrentStreak   int       `json:"current_streak"`
	LongestStreak   int       `json:"longest_streak"`
	TotalSnaps      int       `json:"total_snaps"`
	LastSnapDate    time.Time `json:"last_snap_date"`
	HasSnappedToday bool      `json:"has_snapped_today"`
	FreezesAvailable int      `json:"freezes_available"`
	FreezesUsed      int      `json:"freezes_used"`
}

type FreezeResponse struct {
	Message          string `json:"message"`
	FreezesAvailable int    `json:"freezes_available"`
	FreezesUsed      int    `json:"freezes_used"`
	CurrentStreak    int    `json:"current_streak"`
}

type SnapsListResponse struct {
	Snaps []SnapResponse `json:"snaps"`
	Total int64          `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
}
