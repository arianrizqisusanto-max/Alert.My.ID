package whatsapp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type whatsappClient struct {
	accessToken  string
	phoneNumberID string
	apiURL       string
	httpClient   *http.Client
}

// NewWhatsAppClient creates a new WhatsApp sender client.
func NewWhatsAppClient(accessToken, phoneNumberID, apiURL string) *whatsappClient {
	if apiURL == "" {
		apiURL = "https://graph.facebook.com/v17.0"
	}
	return &whatsappClient{
		accessToken:   accessToken,
		phoneNumberID: phoneNumberID,
		apiURL:        apiURL,
		httpClient:    &http.Client{Timeout: 10 * time.Second},
	}
}

type whatsappTemplatePayload struct {
	MessagingProduct string      `json:"messaging_product"`
	To               string      `json:"to"`
	Type             string      `json:"type"`
	Template         templateObj `json:"template"`
}

type templateObj struct {
	Name     string       `json:"name"`
	Language languageObj  `json:"language"`
	Components []component `json:"components"`
}

type languageObj struct {
	Code string `json:"code"`
}

type component struct {
	Type       string      `json:"type"`
	Parameters []parameter `json:"parameters"`
}

type parameter struct {
	Type string `json:"type"`
	Text string `json:"text,omitempty"`
}

func (c *whatsappClient) Send(ctx context.Context, phoneNumber string, title string, message string, date string, timeStr string) error {
	if c.accessToken == "" || c.phoneNumberID == "" {
		// Mock Mode fallback or error
		return fmt.Errorf("whatsapp credentials not configured")
	}

	url := fmt.Sprintf("%s/%s/messages", c.apiURL, c.phoneNumberID)

	// Construct the template payload
	// Note: Meta WhatsApp API requires predefined templates for business-initiated messages.
	// For Alert.My.ID, we assume a template named 'reminder_alert' is approved with parameters:
	// {{1}} = Title, {{2}} = Message, {{3}} = Date/Time
	payload := whatsappTemplatePayload{
		MessagingProduct: "whatsapp",
		To:               phoneNumber,
		Type:             "template",
		Template: templateObj{
			Name: "reminder_alert",
			Language: languageObj{
				Code: "en_US",
			},
			Components: []component{
				{
					Type: "body",
					Parameters: []parameter{
						{Type: "text", Text: title},
						{Type: "text", Text: message},
						{Type: "text", Text: fmt.Sprintf("%s %s", date, timeStr)},
					},
				},
			},
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.accessToken))
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		var errResponse struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		_ = json.NewDecoder(resp.Body).Decode(&errResponse)
		return fmt.Errorf("whatsapp api error (status %d): %s", resp.StatusCode, errResponse.Error.Message)
	}

	return nil
}
