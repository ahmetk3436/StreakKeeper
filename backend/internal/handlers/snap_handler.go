package handlers

import (
	"errors"

	"github.com/ahmetcoskunkizilkaya/fully-autonomous-mobile-system/backend/internal/dto"
	"github.com/ahmetcoskunkizilkaya/fully-autonomous-mobile-system/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SnapHandler struct {
	snapService *services.SnapService
}

func NewSnapHandler(snapService *services.SnapService) *SnapHandler {
	return &SnapHandler{snapService: snapService}
}

// CreateSnap handles POST /snaps — creates a new snap for the authenticated user.
func (h *SnapHandler) CreateSnap(c *fiber.Ctx) error {
	userID, err := extractUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(dto.ErrorResponse{
			Error: true, Message: "Unauthorized",
		})
	}

	var req dto.CreateSnapRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ErrorResponse{
			Error: true, Message: "Invalid request body",
		})
	}

	snap, err := h.snapService.CreateSnap(userID, req.ImageURL, req.Caption, req.Filter)
	if err != nil {
		if errors.Is(err, services.ErrInvalidFilter) {
			return c.Status(fiber.StatusBadRequest).JSON(dto.ErrorResponse{
				Error: true, Message: err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ErrorResponse{
			Error: true, Message: "Failed to create snap",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(dto.SnapResponse{
		ID:        snap.ID.String(),
		UserID:    snap.UserID.String(),
		ImageURL:  snap.ImageURL,
		Caption:   snap.Caption,
		Filter:    snap.Filter,
		SnapDate:  snap.SnapDate,
		LikeCount: snap.LikeCount,
		CreatedAt: snap.CreatedAt,
	})
}

// GetMySnaps handles GET /snaps — returns paginated snaps for the authenticated user.
func (h *SnapHandler) GetMySnaps(c *fiber.Ctx) error {
	userID, err := extractUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(dto.ErrorResponse{
			Error: true, Message: "Unauthorized",
		})
	}

	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit
	snaps, total, err := h.snapService.GetUserSnaps(userID, limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ErrorResponse{
			Error: true, Message: "Failed to fetch snaps",
		})
	}

	snapResponses := make([]dto.SnapResponse, len(snaps))
	for i, snap := range snaps {
		snapResponses[i] = dto.SnapResponse{
			ID:        snap.ID.String(),
			UserID:    snap.UserID.String(),
			ImageURL:  snap.ImageURL,
			Caption:   snap.Caption,
			Filter:    snap.Filter,
			SnapDate:  snap.SnapDate,
			LikeCount: snap.LikeCount,
			CreatedAt: snap.CreatedAt,
		}
	}

	return c.JSON(dto.SnapsListResponse{
		Snaps: snapResponses,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

// GetStreak handles GET /snaps/streak — returns the authenticated user's streak info.
func (h *SnapHandler) GetStreak(c *fiber.Ctx) error {
	userID, err := extractUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(dto.ErrorResponse{
			Error: true, Message: "Unauthorized",
		})
	}

	streak, err := h.snapService.GetStreak(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ErrorResponse{
			Error: true, Message: "Failed to fetch streak",
		})
	}

	todaySnap, err := h.snapService.GetTodaySnap(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ErrorResponse{
			Error: true, Message: "Failed to check today's snap",
		})
	}

	return c.JSON(dto.StreakResponse{
		CurrentStreak:   streak.CurrentStreak,
		LongestStreak:   streak.LongestStreak,
		TotalSnaps:      streak.TotalSnaps,
		LastSnapDate:    streak.LastSnapDate,
		HasSnappedToday: todaySnap != nil,
	})
}

// DeleteSnap handles DELETE /snaps/:id — soft deletes a snap if owned by the user.
func (h *SnapHandler) DeleteSnap(c *fiber.Ctx) error {
	userID, err := extractUserID(c)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(dto.ErrorResponse{
			Error: true, Message: "Unauthorized",
		})
	}

	snapIDStr := c.Params("id")
	snapID, err := uuid.Parse(snapIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ErrorResponse{
			Error: true, Message: "Invalid snap ID",
		})
	}

	if err := h.snapService.DeleteSnap(userID, snapID); err != nil {
		if errors.Is(err, services.ErrSnapNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(dto.ErrorResponse{
				Error: true, Message: "Snap not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ErrorResponse{
			Error: true, Message: "Failed to delete snap",
		})
	}

	return c.JSON(fiber.Map{"message": "Snap deleted"})
}

// LikeSnap handles POST /snaps/:id/like — increments the like count.
func (h *SnapHandler) LikeSnap(c *fiber.Ctx) error {
	snapIDStr := c.Params("id")
	snapID, err := uuid.Parse(snapIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(dto.ErrorResponse{
			Error: true, Message: "Invalid snap ID",
		})
	}

	if err := h.snapService.LikeSnap(snapID); err != nil {
		if errors.Is(err, services.ErrSnapNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(dto.ErrorResponse{
				Error: true, Message: "Snap not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(dto.ErrorResponse{
			Error: true, Message: "Failed to like snap",
		})
	}

	return c.JSON(fiber.Map{"message": "Snap liked"})
}
