package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"alert-my-id-backend/internal/delivery/telegram"
	"alert-my-id-backend/internal/delivery/whatsapp"
	"alert-my-id-backend/internal/repository/postgres"
	"alert-my-id-backend/internal/usecase"

	"github.com/hibiken/asynq"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// 1. Load .env config
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from system environment variables")
	}

	// Flag to run either in API, Worker, or Monolith (both) mode
	mode := flag.String("mode", "all", "Execution mode: 'api', 'worker', or 'all'")
	flag.Parse()

	// 2. Connect to Database (Postgres)
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	// Configure DB connection pooling (Scale-ready configs)
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatalf("Database is unreachable: %v", err)
	}
	log.Println("Connected to PostgreSQL successfully")

	// 3. Connect to Redis (Asynq client/server)
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6379"
	}
	redisOpt := asynq.RedisClientOpt{Addr: redisURL}

	// Initialize Repository
	repo := postgres.NewPgRepository(db)

	// Initialize Delivery Clients
	tgClient := telegram.NewTelegramClient(os.Getenv("TELEGRAM_BOT_TOKEN"))
	waClient := whatsapp.NewWhatsAppClient(
		os.Getenv("WHATSAPP_ACCESS_TOKEN"),
		os.Getenv("WHATSAPP_PHONE_NUMBER_ID"),
		os.Getenv("WHATSAPP_API_URL"),
	)

	// Initialize Asynq Client
	asynqClient := asynq.NewClient(redisOpt)
	defer asynqClient.Close()

	// Initialize Usecase
	uc := usecase.NewReminderUsecase(repo, repo, repo, asynqClient, tgClient, waClient)

	// Channels for graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	// --- Monolith or Worker Mode ---
	var asynqServer *asynq.Server
	if *mode == "worker" || *mode == "all" {
		asynqServer = asynq.NewServer(
			redisOpt,
			asynq.Config{
				Concurrency: 10, // Number of concurrent workers (adjust as scaling demands)
				Queues: map[string]int{
					"critical": 6,
					"default":  3,
					"low":      1,
				},
			},
		)

		mux := asynq.NewServeMux()
		// Register task handler
		mux.HandleFunc(usecase.TaskReminderTrigger, func(ctx context.Context, t *asynq.Task) error {
			var payload usecase.ReminderTaskPayload
			if err := json.Unmarshal(t.Payload(), &payload); err != nil {
				return fmt.Errorf("json unmarshal failed: %v: %w", err, asynq.SkipRetry)
			}
			
			log.Printf("Executing trigger task for reminder: %s", payload.ReminderID)
			return uc.ProcessReminderTrigger(ctx, payload.ReminderID)
		})

		go func() {
			log.Println("Starting Asynq worker daemon...")
			if err := asynqServer.Run(mux); err != nil {
				log.Fatalf("Asynq server failed to run: %v", err)
			}
		}()
	}

	// --- Monolith or API Mode ---
	var httpServer *http.Server
	if *mode == "api" || *mode == "all" {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}

		mux := http.NewServeMux()
		
		// Liveness & Readiness checks
		mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"status":"healthy"}`))
		})

		// Trigger manual cron-job endpoint (similar to old Next.js API, but scheduling in Asynq)
		mux.HandleFunc("/api/cron/process-reminders", func(w http.ResponseWriter, r *http.Request) {
			// Basic secret auth check
			secret := os.Getenv("CRON_SECRET")
			if secret != "" {
				authHeader := r.Header.Get("Authorization")
				querySecret := r.URL.Query().Get("secret")
				if authHeader != "Bearer "+secret && querySecret != secret {
					http.Error(w, "Unauthorized", http.StatusUnauthorized)
					return
				}
			}

			// In our Scale-Ready DB setup, we don't query db here, but let's schedule any newly added active reminders
			// in case we missed them, or sync calendars.
			log.Println("Cron trigger API hit. Syncing states...")
			
			reminders, err := repo.GetActiveReminders(r.Context())
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			count := 0
			for _, rem := range reminders {
				// We attempt to schedule active reminders.
				// For real scale-ready setup, scheduling happens at CRUD operations, but fallback check is good.
				err := uc.ScheduleReminder(r.Context(), rem)
				if err == nil {
					count++
				}
			}

			w.Header().Set("Content-Type", "application/json")
			_, _ = w.Write([]byte(fmt.Sprintf(`{"success":true,"scheduled_count":%d}`, count)))
		})

		httpServer = &http.Server{
			Addr:    ":" + port,
			Handler: mux,
		}

		go func() {
			log.Printf("Starting HTTP API gateway on port %s...", port)
			if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				log.Fatalf("HTTP server failed: %v", err)
			}
		}()
	}

	// Graceful shutdown wait
	<-stop
	log.Println("Shutting down backend services gracefully...")

	if httpServer != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(ctx); err != nil {
			log.Printf("Error shutting down HTTP server: %v", err)
		}
	}

	if asynqServer != nil {
		asynqServer.Shutdown()
	}

	log.Println("Backend shutdown complete.")
}
