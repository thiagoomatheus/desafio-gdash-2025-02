package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Latitude      float64 `json:"source_city_lat"`
	Longitude     float64 `json:"source_city_long"`
	CollectedAt   string  `json:"collected_at"`
	CurrentWeather struct {
		Temperature float64 `json:"temperature_2m"`
	} `json:"current"`
}

var (
	RabbitMQURL  = os.Getenv("RABBITMQ_URL")   // Ex: amqp://user:pass@host:5672/
	QueueName    = os.Getenv("RABBITMQ_QUEUE") // Ex: weather_data
	ApiURL       = os.Getenv("API_URL")        // Ex: http://backend:3000/api/weather
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}

func connectRabbitMQ() (*amqp.Connection, error) {
	var counts int64
	var backOff = 1 * time.Second
	var connection *amqp.Connection
	var err error

	for {
		connection, err = amqp.Dial(RabbitMQURL)
		if err == nil {
			log.Println(" ✅ Conectado ao RabbitMQ!")
			return connection, nil
		}

		if counts > 5 {
			return nil, err
		}

		log.Printf(" ⚠️ Falha ao conectar no RabbitMQ (Tentativa %d/5). Retentando em %v...", counts+1, backOff)
		time.Sleep(backOff)
		backOff *= 2
		counts++
	}
}

func main() {
	if RabbitMQURL == "" {
		RabbitMQURL = "amqp://user:password@localhost:5672/"
	}

	if QueueName == "" {
		QueueName = "weather_data"
	}

	if ApiURL == "" {
		ApiURL = "http://localhost:3000/api/weather/logs" 
	}

	conn, err := connectRabbitMQ()
	failOnError(err, "Falha crítica ao conectar no RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Falha ao abrir canal")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		QueueName, // nome
		true,      // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Falha ao declarar fila")

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer tag
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	failOnError(err, "Falha ao registrar consumidor")

	log.Printf("🐹 Worker Go iniciado. Aguardando mensagens na fila '%s'...", QueueName)

	forever := make(chan struct{})

	go func() {
		for d := range msgs {

			var data WeatherData
			if err := json.Unmarshal(d.Body, &data); err != nil {
				log.Printf("❌ JSON Inválido: %v. Descartando.", err)
				d.Ack(false) 
				continue
			}

			if data.Latitude == 0 || data.Longitude == 0 {
				log.Printf("❌ Dados sem geolocalização. Descartando.")
				d.Ack(false)
				continue
			}

			log.Printf("✨ Dados Válidos! (Temp: %.1f°C em %s)", data.CurrentWeather.Temperature, data.CollectedAt)

			statusCode, err := sendToBackend(d.Body)

			// CENÁRIO 1: Sucesso
			if err == nil && statusCode >= 200 && statusCode < 300 {
				log.Println("✅ Sucesso! Dados processados.")
				d.Ack(false)
				continue
			}

			// CENÁRIO 2: Erro Permanente (Ex: 400 Bad Request)
			if statusCode >= 400 && statusCode < 500 {
				log.Printf("⛔ Erro 4xx (%d). Backend rejeitou os dados. Descartando.", statusCode)
				d.Ack(false) // Não adianta tentar de novo
				continue
			}

			// CENÁRIO 3: Erro Transiente (Rede ou 500)
			log.Printf("⚠️ Erro temporário (Rede ou 500). Retentando em 10s...")
			time.Sleep(10 * time.Second) 
			d.Nack(false, true) // Devolve para a fila (Requeue)
		}
	}()

	<-forever
}

func sendToBackend(jsonData []byte) (int, error) {
	
	req, err := http.NewRequest("POST", ApiURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	return resp.StatusCode, nil
}