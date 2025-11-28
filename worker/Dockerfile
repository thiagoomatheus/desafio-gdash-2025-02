# Etapa 1: Builder
FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o worker main.go

# Etapa 2: Imagem Final
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/worker .

CMD ["./worker"]