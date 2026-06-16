# Stage 1: Build
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git and certificates
RUN apk add --no-cache git ca-certificates

# Copy go mod and sum files
COPY go.mod ./
# If go.sum is not present yet, it will be generated during go mod tidy
RUN go mod tidy

# Copy the source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Stage 2: Runtime
FROM alpine:3.18

WORKDIR /app

# Copy CA certificates for secure HTTPS external API calls
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/main .
COPY --from=builder /app/.env.example .env

EXPOSE 8080

CMD ["./main", "-mode", "all"]
