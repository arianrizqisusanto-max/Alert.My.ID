package domain

import (
	"context"
	"time"
)

// User represents the user account details.
type User struct {
	ID             string    `json:"id"`
	Email          string    `json:"email"`
	Name           string    `json:"name"`
	Avatar         string    `json:"avatar"`
	TelegramChatID string    `json:"telegram_chat_id"`
	WhatsAppNumber string    `json:"whatsapp_number"`
	CreatedAt      time.Time `json:"created_at"`
}

// Subscription represents a billing plan subscription.
type Subscription struct {
	ID                   string    `json:"id"`
	UserID               string    `json:"user_id"`
	PlanID               string    `json:"plan_id"`
	StartDate            time.Time `json:"start_date"`
	EndDate              time.Time `json:"end_date"`
	Status               string    `json:"status"` // 'active', 'trialing', 'past_due', 'canceled'
	StripeSubscriptionID string    `json:"stripe_subscription_id"`
	CreatedAt            time.Time `json:"created_at"`
}

// Reminder represents a scheduled alert.
type Reminder struct {
	ID                   string    `json:"id"`
	UserID               string    `json:"user_id"`
	Title                string    `json:"title"`
	Message              string    `json:"message"`
	ReminderDate         string    `json:"reminder_date"` // YYYY-MM-DD
	ReminderTime         string    `json:"reminder_time"` // HH:MM:SS
	Timezone             string    `json:"timezone"`      // e.g. 'Asia/Jakarta'
	NotificationChannels []string  `json:"notification_channels"`
	RecurringType        string    `json:"recurring_type"` // 'one_time', 'daily', 'weekly', 'monthly', 'yearly'
	Status               string    `json:"status"`         // 'active', 'completed', 'cancelled'
	CreatedAt            time.Time `json:"created_at"`
}

// ReminderLog represents a history entry of a reminder delivery.
type ReminderLog struct {
	ID             string    `json:"id"`
	ReminderID     string    `json:"reminder_id"`
	SentAt         time.Time `json:"sent_at"`
	Channel        string    `json:"channel"` // 'telegram', 'whatsapp'
	DeliveryStatus string    `json:"delivery_status"`
	ErrorMessage   string    `json:"error_message"`
}

// UserRepository defines the contract for user data access.
type UserRepository interface {
	GetByID(ctx context.Context, id string) (*User, error)
	UpdateTelegramChatID(ctx context.Context, id string, chatID string) error
	UpdateWhatsAppNumber(ctx context.Context, id string, number string) error
}

// ReminderRepository defines the contract for reminder data access.
type ReminderRepository interface {
	GetByID(ctx context.Context, id string) (*Reminder, error)
	GetActiveReminders(ctx context.Context) ([]*Reminder, error)
	Save(ctx context.Context, reminder *Reminder) error
	Update(ctx context.Context, reminder *Reminder) error
	Delete(ctx context.Context, id string) error
}

// ReminderLogRepository defines the contract for log data access.
type ReminderLogRepository interface {
	Create(ctx context.Context, log *ReminderLog) error
	GetByReminderID(ctx context.Context, reminderID string) ([]*ReminderLog, error)
}

// ReminderUsecase defines the business logic contract.
type ReminderUsecase interface {
	ScheduleReminder(ctx context.Context, reminder *Reminder) error
	ProcessReminderTrigger(ctx context.Context, reminderID string) error
	CancelReminder(ctx context.Context, id string) error
}
