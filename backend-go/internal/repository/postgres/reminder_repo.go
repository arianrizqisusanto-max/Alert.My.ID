package postgres

import (
	"context"
	"database/sql"
	"errors"
	"alert-my-id-backend/internal/domain"
	"github.com/lib/pq"
)

type pgRepository struct {
	db *sql.DB
}

// NewPgRepository creates a new instance of Postgres repositories.
func NewPgRepository(db *sql.DB) *pgRepository {
	return &pgRepository{db: db}
}

// --- UserRepository Implementation ---

func (r *pgRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `SELECT id, email, name, avatar, telegram_chat_id, whatsapp_number, created_at 
	          FROM public.users WHERE id = $1`
	
	row := r.db.QueryRowContext(ctx, query, id)
	
	var user domain.User
	var telegramChatID sql.NullString
	var whatsappNumber sql.NullString
	var name sql.NullString
	var avatar sql.NullString

	err := row.Scan(&user.ID, &user.Email, &name, &avatar, &telegramChatID, &whatsappNumber, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	user.Name = name.String
	user.Avatar = avatar.String
	user.TelegramChatID = telegramChatID.String
	user.WhatsAppNumber = whatsappNumber.String

	return &user, nil
}

func (r *pgRepository) UpdateTelegramChatID(ctx context.Context, id string, chatID string) error {
	query := `UPDATE public.users SET telegram_chat_id = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, chatID, id)
	return err
}

func (r *pgRepository) UpdateWhatsAppNumber(ctx context.Context, id string, number string) error {
	query := `UPDATE public.users SET whatsapp_number = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, number, id)
	return err
}

// --- ReminderRepository Implementation ---

func (r *pgRepository) GetByID(ctx context.Context, id string) (*domain.Reminder, error) {
	query := `SELECT id, user_id, title, message, reminder_date, reminder_time, timezone, notification_channels, recurring_type, status, created_at 
	          FROM public.reminders WHERE id = $1`
	
	row := r.db.QueryRowContext(ctx, query, id)
	
	var rem domain.Reminder
	var message sql.NullString
	var channels []string

	err := row.Scan(
		&rem.ID, &rem.UserID, &rem.Title, &message, 
		&rem.ReminderDate, &rem.ReminderTime, &rem.Timezone, 
		pq.Array(&channels), &rem.RecurringType, &rem.Status, &rem.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("reminder not found")
		}
		return nil, err
	}

	rem.Message = message.String
	rem.NotificationChannels = channels
	return &rem, nil
}

func (r *pgRepository) GetActiveReminders(ctx context.Context) ([]*domain.Reminder, error) {
	query := `SELECT id, user_id, title, message, reminder_date, reminder_time, timezone, notification_channels, recurring_type, status, created_at 
	          FROM public.reminders WHERE status = 'active'`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reminders []*domain.Reminder
	for rows.Next() {
		var rem domain.Reminder
		var message sql.NullString
		var channels []string

		err := rows.Scan(
			&rem.ID, &rem.UserID, &rem.Title, &message, 
			&rem.ReminderDate, &rem.ReminderTime, &rem.Timezone, 
			pq.Array(&channels), &rem.RecurringType, &rem.Status, &rem.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		rem.Message = message.String
		rem.NotificationChannels = channels
		reminders = append(reminders, &rem)
	}

	return reminders, nil
}

func (r *pgRepository) Save(ctx context.Context, rem *domain.Reminder) error {
	query := `INSERT INTO public.reminders (id, user_id, title, message, reminder_date, reminder_time, timezone, notification_channels, recurring_type, status, created_at)
	          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	
	_, err := r.db.ExecContext(ctx, query,
		rem.ID, rem.UserID, rem.Title, rem.Message,
		rem.ReminderDate, rem.ReminderTime, rem.Timezone,
		pq.Array(rem.NotificationChannels), rem.RecurringType, rem.Status, rem.CreatedAt,
	)
	return err
}

func (r *pgRepository) Update(ctx context.Context, rem *domain.Reminder) error {
	query := `UPDATE public.reminders 
	          SET title = $1, message = $2, reminder_date = $3, reminder_time = $4, timezone = $5, notification_channels = $6, recurring_type = $7, status = $8
	          WHERE id = $9`
	
	_, err := r.db.ExecContext(ctx, query,
		rem.Title, rem.Message, rem.ReminderDate, rem.ReminderTime, rem.Timezone,
		pq.Array(rem.NotificationChannels), rem.RecurringType, rem.Status, rem.ID,
	)
	return err
}

func (r *pgRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM public.reminders WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// --- ReminderLogRepository Implementation ---

func (r *pgRepository) Create(ctx context.Context, log *domain.ReminderLog) error {
	query := `INSERT INTO public.reminder_logs (id, reminder_id, sent_at, channel, delivery_status, error_message)
	          VALUES ($1, $2, $3, $4, $5, $6)`
	
	_, err := r.db.ExecContext(ctx, query,
		log.ID, log.ReminderID, log.SentAt, log.Channel, log.DeliveryStatus, log.ErrorMessage,
	)
	return err
}

func (r *pgRepository) GetByReminderID(ctx context.Context, reminderID string) ([]*domain.ReminderLog, error) {
	query := `SELECT id, reminder_id, sent_at, channel, delivery_status, error_message 
	          FROM public.reminder_logs WHERE reminder_id = $1 ORDER BY sent_at DESC`
	
	rows, err := r.db.QueryContext(ctx, query, reminderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []*domain.ReminderLog
	for rows.Next() {
		var log domain.ReminderLog
		var errMsg sql.NullString

		err := rows.Scan(&log.ID, &log.ReminderID, &log.SentAt, &log.Channel, &log.DeliveryStatus, &errMsg)
		if err != nil {
			return nil, err
		}
		log.ErrorMessage = errMsg.String
		logs = append(logs, &log)
	}

	return logs, nil
}
