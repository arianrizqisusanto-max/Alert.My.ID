package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"alert-my-id-backend/internal/domain"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

const (
	// TaskReminderTrigger is the task type name for reminder trigger.
	TaskReminderTrigger = "reminder:trigger"
)

// ReminderTaskPayload defines the payload for Asynq task.
type ReminderTaskPayload struct {
	ReminderID string `json:"reminder_id"`
}

type reminderUsecase struct {
	reminderRepo domain.ReminderRepository
	userRepo     domain.UserRepository
	logRepo      domain.ReminderLogRepository
	asynqClient  *asynq.Client
	tgClient     TelegramSender
	waClient     WhatsAppSender
}

// TelegramSender is the interface for Telegram notifications.
type TelegramSender interface {
	Send(ctx context.Context, chatID string, text string) error
}

// WhatsAppSender is the interface for WhatsApp notifications.
type WhatsAppSender interface {
	Send(ctx context.Context, phoneNumber string, title string, message string, date string, timeStr string) error
}

// NewReminderUsecase creates a new instance of ReminderUsecase.
func NewReminderUsecase(
	rr domain.ReminderRepository,
	ur domain.UserRepository,
	lr domain.ReminderLogRepository,
	ac *asynq.Client,
	tg TelegramSender,
	wa WhatsAppSender,
) domain.ReminderUsecase {
	return &reminderUsecase{
		reminderRepo: rr,
		userRepo:     ur,
		logRepo:      lr,
		asynqClient:  ac,
		tgClient:     tg,
		waClient:     wa,
	}
}

// ScheduleReminder schedules the reminder in Asynq.
func (u *reminderUsecase) ScheduleReminder(ctx context.Context, rem *domain.Reminder) error {
	// Parse scheduled date and time with target timezone
	loc, err := time.LoadLocation(rem.Timezone)
	if err != nil {
		return fmt.Errorf("invalid timezone: %w", err)
	}

	timeStr := fmt.Sprintf("%sT%s", rem.ReminderDate, rem.ReminderTime)
	// Parse time in the reminder's target location
	scheduledTime, err := time.ParseInLocation("2006-01-02T15:04:05", timeStr, loc)
	if err != nil {
		// Try format without seconds
		scheduledTime, err = time.ParseInLocation("2006-01-02T15:04", timeStr, loc)
		if err != nil {
			return fmt.Errorf("invalid reminder date/time format: %w", err)
		}
	}

	now := time.Now().In(loc)
	delay := scheduledTime.Sub(now)

	// If the time has already passed, run it immediately or skip if one-time
	if delay <= 0 {
		if rem.RecurringType == "one_time" {
			return errors.New("cannot schedule a one-time reminder in the past")
		}
		// If recurring, calculate the next valid scheduled time
		scheduledTime = u.calculateNextOccurrence(scheduledTime, rem.RecurringType)
		delay = scheduledTime.Sub(now)
	}

	payload, err := json.Marshal(ReminderTaskPayload{ReminderID: rem.ID})
	if err != nil {
		return err
	}

	task := asynq.NewTask(TaskReminderTrigger, payload)
	
	// Enqueue task with the calculated delay
	info, err := u.asynqClient.Enqueue(task, asynq.ProcessAt(scheduledTime), asynq.TaskID(rem.ID))
	if err != nil {
		// If task already exists, we should update/recreate it (Asynq doesn't allow direct update, we can handle it or let it fail)
		return fmt.Errorf("failed to enqueue task: %w", err)
	}

	log.Printf("Scheduled reminder %s to trigger at %s (Task ID: %s)", rem.ID, scheduledTime.String(), info.ID)
	return nil
}

// ProcessReminderTrigger triggers the delivery of the reminder to selected channels.
func (u *reminderUsecase) ProcessReminderTrigger(ctx context.Context, reminderID string) error {
	rem, err := u.reminderRepo.GetByID(ctx, reminderID)
	if err != nil {
		return fmt.Errorf("failed to fetch reminder: %w", err)
	}

	if rem.Status != "active" {
		log.Printf("Reminder %s status is not active (%s), skipping delivery", rem.ID, rem.Status)
		return nil
	}

	user, err := u.userRepo.GetByID(ctx, rem.UserID)
	if err != nil {
		return fmt.Errorf("failed to fetch user details: %w", err)
	}

	for _, channel := range rem.NotificationChannels {
		deliveryStatus := "sent"
		var errMsg string

		switch channel {
		case "telegram":
			if user.TelegramChatID == "" {
				deliveryStatus = "failed"
				errMsg = "Telegram chat ID not configured by user"
			} else {
				text := fmt.Sprintf("🔔 *Reminder Alert: %s*\n\n%s\n\n_Scheduled: %s %s (%s)_", 
					rem.Title, rem.Message, rem.ReminderDate, rem.ReminderTime, rem.Timezone)
				err = u.tgClient.Send(ctx, user.TelegramChatID, text)
				if err != nil {
					deliveryStatus = "failed"
					errMsg = err.Error()
				}
			}
		case "whatsapp":
			if user.WhatsAppNumber == "" {
				deliveryStatus = "failed"
				errMsg = "WhatsApp phone number not configured by user"
			} else {
				err = u.waClient.Send(ctx, user.WhatsAppNumber, rem.Title, rem.Message, rem.ReminderDate, rem.ReminderTime)
				if err != nil {
					deliveryStatus = "failed"
					errMsg = err.Error()
				}
			}
		default:
			deliveryStatus = "failed"
			errMsg = fmt.Sprintf("Unsupported notification channel: %s", channel)
		}

		// Insert Log
		logEntry := &domain.ReminderLog{
			ID:             uuid.New().String(),
			ReminderID:     rem.ID,
			SentAt:         time.Now().UTC(),
			Channel:        channel,
			DeliveryStatus: deliveryStatus,
			ErrorMessage:   errMsg,
		}

		if errLog := u.logRepo.Create(ctx, logEntry); errLog != nil {
			log.Printf("Error creating reminder log: %v", errLog)
		}
	}

	// Update status or schedule next occurrence
	if rem.RecurringType == "one_time" {
		rem.Status = "completed"
		return u.reminderRepo.Update(ctx, rem)
	}

	// Recurring: calculate next date and update
	loc, err := time.LoadLocation(rem.Timezone)
	if err != nil {
		return err
	}

	timeStr := fmt.Sprintf("%sT%s", rem.ReminderDate, rem.ReminderTime)
	currentScheduled, err := time.ParseInLocation("2006-01-02T15:04:05", timeStr, loc)
	if err != nil {
		currentScheduled, _ = time.ParseInLocation("2006-01-02T15:04", timeStr, loc)
	}

	nextScheduled := u.calculateNextOccurrence(currentScheduled, rem.RecurringType)
	rem.ReminderDate = nextScheduled.Format("2006-01-02")
	rem.ReminderTime = nextScheduled.Format("15:04:05")

	err = u.reminderRepo.Update(ctx, rem)
	if err != nil {
		return fmt.Errorf("failed to update recurring reminder: %w", err)
	}

	// Schedule next job in Asynq
	return u.ScheduleReminder(ctx, rem)
}

// CancelReminder deletes or cancels the scheduled reminder task.
func (u *reminderUsecase) CancelReminder(ctx context.Context, id string) error {
	rem, err := u.reminderRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	rem.Status = "cancelled"
	err = u.reminderRepo.Update(ctx, rem)
	if err != nil {
		return err
	}

	// Remove from Asynq scheduler queue
	inspector := asynq.NewInspector(asynq.RedisClientOpt{Addr: "localhost:6379"}) // We should pass option config ideally
	err = inspector.DeleteTask("default", id)
	if err != nil && !errors.Is(err, asynq.ErrTaskNotFound) {
		log.Printf("Warning: Failed to remove task %s from Asynq queue: %v", id, err)
	}

	return nil
}

func (u *reminderUsecase) calculateNextOccurrence(current time.Time, recurringType string) time.Time {
	switch recurringType {
	case "daily":
		return current.AddDate(0, 0, 1)
	case "weekly":
		return current.AddDate(0, 0, 7)
	case "monthly":
		return current.AddDate(0, 1, 0)
	case "yearly":
		return current.AddDate(1, 0, 0)
	default:
		return current
	}
}
