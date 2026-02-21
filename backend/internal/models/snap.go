package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Snap struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID      uuid.UUID      `gorm:"type:uuid;index" json:"user_id"`
	ImageURL    string         `gorm:"type:text" json:"image_url"`
	Caption     string         `gorm:"type:varchar(280)" json:"caption"`
	Filter      string         `gorm:"type:varchar(50)" json:"filter"`
	SnapDate    time.Time      `gorm:"index" json:"snap_date"`
	LikeCount   int            `gorm:"default:0" json:"like_count"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type SnapStreak struct {
	ID               uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID           uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"user_id"`
	CurrentStreak    int       `gorm:"default:0" json:"current_streak"`
	LongestStreak    int       `gorm:"default:0" json:"longest_streak"`
	TotalSnaps       int       `gorm:"default:0" json:"total_snaps"`
	LastSnapDate     time.Time `json:"last_snap_date"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	FreezesAvailable int       `json:"freezes_available" gorm:"default:0"`
	FreezesUsed      int       `json:"freezes_used" gorm:"default:0"`
	LastFreezeDate   time.Time `json:"last_freeze_date"`
}

var SnapFilters = []string{"none", "vintage", "warm", "cool", "dramatic", "minimal", "vibrant", "noir"}
