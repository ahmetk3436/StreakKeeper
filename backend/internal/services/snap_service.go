package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/ahmetcoskunkizilkaya/fully-autonomous-mobile-system/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrInvalidFilter = errors.New("invalid filter")
	ErrSnapNotFound  = errors.New("snap not found")
	ErrNotOwner      = errors.New("you can only delete your own snaps")
)

type SnapService struct {
	db *gorm.DB
}

func NewSnapService(db *gorm.DB) *SnapService {
	return &SnapService{db: db}
}

// CreateSnap creates a new snap and updates the user's streak.
func (s *SnapService) CreateSnap(userID uuid.UUID, imageURL string, caption string, filter string) (*models.Snap, error) {
	// Validate filter
	validFilter := false
	for _, f := range models.SnapFilters {
		if f == filter {
			validFilter = true
			break
		}
	}
	if !validFilter {
		return nil, ErrInvalidFilter
	}

	snap := models.Snap{
		ID:       uuid.New(),
		UserID:   userID,
		ImageURL: imageURL,
		Caption:  caption,
		Filter:   filter,
		SnapDate: time.Now(),
	}

	if err := s.db.Create(&snap).Error; err != nil {
		return nil, fmt.Errorf("failed to create snap: %w", err)
	}

	// Update streak after successful snap creation
	if err := s.updateStreak(userID); err != nil {
		// Log but don't fail the snap creation
		fmt.Printf("warning: failed to update streak for user %s: %v\n", userID, err)
	}

	return &snap, nil
}

// updateStreak updates the streak record for the user based on when they last snapped.
func (s *SnapService) updateStreak(userID uuid.UUID) error {
	var streak models.SnapStreak
	err := s.db.Where("user_id = ?", userID).First(&streak).Error

	now := time.Now()
	today := now.Truncate(24 * time.Hour)

	if errors.Is(err, gorm.ErrRecordNotFound) {
		// Create new streak record
		streak = models.SnapStreak{
			ID:            uuid.New(),
			UserID:        userID,
			CurrentStreak: 1,
			LongestStreak: 1,
			TotalSnaps:    1,
			LastSnapDate:  now,
		}
		return s.db.Create(&streak).Error
	} else if err != nil {
		return fmt.Errorf("failed to find streak: %w", err)
	}

	lastSnapDay := streak.LastSnapDate.Truncate(24 * time.Hour)

	if lastSnapDay.Equal(today) {
		// Already snapped today, just increment total
		streak.TotalSnaps++
		streak.LastSnapDate = now
		return s.db.Save(&streak).Error
	}

	yesterday := today.Add(-24 * time.Hour)
	if lastSnapDay.Equal(yesterday) {
		// Consecutive day, increment streak
		streak.CurrentStreak++
	} else {
		// Streak broken, reset to 1
		streak.CurrentStreak = 1
	}

	if streak.CurrentStreak > streak.LongestStreak {
		streak.LongestStreak = streak.CurrentStreak
	}

	streak.TotalSnaps++
	streak.LastSnapDate = now

	return s.db.Save(&streak).Error
}

// GetUserSnaps returns paginated snaps for a user.
func (s *SnapService) GetUserSnaps(userID uuid.UUID, limit int, offset int) ([]models.Snap, int64, error) {
	var snaps []models.Snap
	var total int64

	s.db.Model(&models.Snap{}).Where("user_id = ?", userID).Count(&total)

	err := s.db.Where("user_id = ?", userID).
		Order("snap_date DESC").
		Limit(limit).
		Offset(offset).
		Find(&snaps).Error

	return snaps, total, err
}

// GetStreak returns the streak record for a user.
func (s *SnapService) GetStreak(userID uuid.UUID) (*models.SnapStreak, error) {
	var streak models.SnapStreak
	err := s.db.Where("user_id = ?", userID).First(&streak).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return &models.SnapStreak{
			UserID:        userID,
			CurrentStreak: 0,
			LongestStreak: 0,
			TotalSnaps:    0,
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get streak: %w", err)
	}
	return &streak, nil
}

// GetTodaySnap checks if the user has already posted a snap today.
func (s *SnapService) GetTodaySnap(userID uuid.UUID) (*models.Snap, error) {
	today := time.Now().Truncate(24 * time.Hour)
	var snap models.Snap
	err := s.db.Where("user_id = ? AND snap_date >= ?", userID, today).
		Order("snap_date DESC").
		First(&snap).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to check today's snap: %w", err)
	}
	return &snap, nil
}

// DeleteSnap soft-deletes a snap only if owned by the user.
func (s *SnapService) DeleteSnap(userID uuid.UUID, snapID uuid.UUID) error {
	result := s.db.Where("id = ? AND user_id = ?", snapID, userID).Delete(&models.Snap{})
	if result.Error != nil {
		return fmt.Errorf("failed to delete snap: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrSnapNotFound
	}
	return nil
}

// LikeSnap increments the like count for a snap.
func (s *SnapService) LikeSnap(snapID uuid.UUID) error {
	result := s.db.Model(&models.Snap{}).
		Where("id = ?", snapID).
		UpdateColumn("like_count", gorm.Expr("like_count + 1"))
	if result.Error != nil {
		return fmt.Errorf("failed to like snap: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrSnapNotFound
	}
	return nil
}
