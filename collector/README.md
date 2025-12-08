# 📡 Weather Collector (Python)

Microsserviço responsável pela extração de dados meteorológicos. Ele atua como um **Producer**, buscando dados externos e enviando para uma fila de mensagens.

## 🛠️ Tecnologias

- **Linguagem:** Python 3.11
- **Libs:** `requests` (HTTP), `pika` (RabbitMQ), `schedule` (Agendamento)
- **Fonte de Dados:** Open-Meteo API

## ⚙️ Variáveis de Ambiente

```env
RABBITMQ_HOST="localhost" (ou "rabbitmq" no Docker)
RABBITMQ_USER="user"
RABBITMQ_PASS="password"
RABBITMQ_QUEUE="weather_data"
```

## 🚀 Funcionamento

1. O script roda um agendador (`schedule`) a cada **5 minutos**.
2. Busca dados de:
   - Temperatura, Umidade, Vento.
   - **Radiação Solar (W/m²)** e Cobertura de Nuvens.
   - Previsão diária (UV, Nascer/Pôr do sol).
3. Converte para JSON e publica na fila RabbitMQ.

## 🏃 Como Rodar Localmente

```bash
# Crie o ambiente virtual
python -m venv venv
source venv/bin/activate # ou venv\Scripts\activate no Windows

# Instale deps
pip install -r requirements.txt

# Execute
python main.py
```