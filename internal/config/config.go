// Package config loads runtime configuration from environment variables.
package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all runtime settings for the API.
type Config struct {
	// Server
	Port string
	Env  string // "development" | "production"

	// Frontend integration
	FrontendURL    string   // SPA base URL for the OAuth redirect, e.g. http://localhost:5173
	AllowedOrigins []string // CORS allow-list (production; dev uses the Vite proxy)

	// Database
	DatabaseURL string // postgres DSN, e.g. postgres://user:pass@host:5432/db?sslmode=disable

	// Auth
	JWTSecret       string
	JWTAccessTTLMin int

	// Discord OAuth2 + role sync
	DiscordClientID     string
	DiscordClientSecret string
	DiscordRedirectURL  string
	DiscordGuildID      string
	DiscordBotToken     string
	DiscordWebhookURL   string

	// Game-server ingest authentication
	ServiceToken string
}

// Load reads configuration from the environment, applying defaults for local
// development. A .env file is loaded if present but is optional.
func Load() (*Config, error) {
	_ = godotenv.Load() // optional; ignore if absent

	frontendURL := getEnv("FRONTEND_URL", "http://localhost:5173")

	cfg := &Config{
		Port:                getEnv("PORT", "8080"),
		Env:                 getEnv("APP_ENV", "development"),
		FrontendURL:         frontendURL,
		AllowedOrigins:      splitCSV(getEnv("ALLOWED_ORIGINS", frontendURL)),
		DatabaseURL:         os.Getenv("DATABASE_URL"),
		JWTSecret:           os.Getenv("JWT_SECRET"),
		JWTAccessTTLMin:     getEnvInt("JWT_ACCESS_TTL_MIN", 15),
		DiscordClientID:     os.Getenv("DISCORD_CLIENT_ID"),
		DiscordClientSecret: os.Getenv("DISCORD_CLIENT_SECRET"),
		DiscordRedirectURL:  os.Getenv("DISCORD_REDIRECT_URL"),
		DiscordGuildID:      os.Getenv("DISCORD_GUILD_ID"),
		DiscordBotToken:     os.Getenv("DISCORD_BOT_TOKEN"),
		DiscordWebhookURL:   os.Getenv("DISCORD_WEBHOOK_URL"),
		ServiceToken:        os.Getenv("SERVICE_TOKEN"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// splitCSV parses a comma-separated env value into a trimmed, non-empty slice.
func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		var n int
		if _, err := fmt.Sscanf(v, "%d", &n); err == nil {
			return n
		}
	}
	return fallback
}
