# 🐹 Data Worker (Go)

Microsserviço de processamento de alta performance. Atua como **Consumer**, lendo a fila do RabbitMQ e garantindo que os dados cheguem ao Backend com integridade.

## 🛠️ Tecnologias

- **Linguagem:** Go (Golang) 1.22
- **Lib:** `amqp091-go` (RabbitMQ Client)
- **Arquitetura:** Retry Pattern & Exponential Backoff

## ⚙️ Variáveis de Ambiente

```env
RABBITMQ_URL="amqp://user:password@localhost:5672/"
RABBITMQ_QUEUE="weather_data"
API_URL="http://localhost:3000/api/weather/logs"
```

## 🛡️ Resiliência e Lógica

O Worker implementa uma lógica robusta de tratamento de erros:

1. **Conexão:** Tenta reconectar ao RabbitMQ automaticamente se cair.
2. **Validação:** Verifica se o JSON recebido possui os campos obrigatórios (Geo, Temperatura).
3.  **Retry:**
    - Se o Backend retornar `5xx` (Erro de Servidor) ou cair, o Worker faz **Nack + Requeue** (tenta de novo após um delay).
    - Se o Backend retornar `4xx` (Erro de Dados) ou JSON inválido, o Worker faz **Ack** (descarta a mensagem para não travar a fila).

## 🏃 Como Rodar Localmente

```bash
# Baixe as dependências
go mod download

# Execute
go run main.go
```