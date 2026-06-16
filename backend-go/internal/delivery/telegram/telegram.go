package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type telegramClient struct {
	botToken   string
	httpClient *http.Client
	
	// Rate limiting: 30 requests per second globally
	rateLimiter  *time.Ticker
	mu           sync.Mutex
	lastSentChat map[string]time.Time
}

// NewTelegramClient creates a new Telegram sender client with built-in rate limiting.
func NewTelegramClient(botToken string) *telegramClient {
	return &telegramClient{
		botToken:     botToken,
		httpClient:   &http.Client{Timeout: 10 * time.Second},
		rateLimiter:  time.NewTicker(time.Second / 30), // 30 requests/sec limit
		lastSentChat: make(map[string]time.Time),
	}
}

type telegramMessagePayload struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode"`
}

func (c *telegramClient) Send(ctx context.Context, chatID string, text string) error {
	if c.botToken == "" {
		return fmt.Errorf("telegram bot token is empty")
	}

	// 1. Specific Chat Rate Limiting: Max 1 message/second to a single chat ID
	c.mu.Lock()
	lastSent, exists := c.lastSentChat[chatID]
	if exists {
		elapsed := time.Since(lastSent)
		if elapsed < time.Second {
			// Sleep for the remaining duration to satisfy the 1-second limit
			time.Sleep(time.Second - elapsed)
		}
	}
	c.lastSentChat[chatID] = time.Now()
	c.mu.Unlock()

	// 2. Global Rate Limiting: Wait for the ticker to tick before sending
	select {
	case <-c.rateLimiter.C:
		// Safe to send
	case <-ctx.Done():
		return ctx.Err()
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", c.botToken)
	payload := telegramMessagePayload{
		ChatID:    chatID,
		Text:      text,
		ParseMode: "Markdown",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResponse struct {
			Description string `json:"description"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&errResponse)
		return fmt.Errorf("telegram api error (status %d): %s", resp.StatusCode, errResponse.Description)
	}

	return nil
}
