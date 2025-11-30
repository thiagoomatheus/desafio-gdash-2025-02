import os
import requests
import pika
import json
import time
from datetime import datetime
import logging
import schedule

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'user')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'password')
QUEUE_NAME = os.getenv('RABBITMQ_QUEUE', 'weather_data')

API_URL = "https://api.open-meteo.com/v1/forecast"
LAT = -23.3863
LONG = -48.7244
COLLECT_INTERVAL = 3600  # 1 hora

WEATHER_OPTIONS = {
    "timezone": "America/Sao_Paulo",
    "current": [
        "temperature_2m",        # Temperatura atual
        "relative_humidity_2m",  # Umidade
        "apparent_temperature",  # Sensação térmica
        "precipitation",         # Chuva agora (mm)
        "weather_code",          # CÓDIGO DO ÍCONE (0=Sol, 1=Nublado, etc)
        "is_day",                # 1 = Dia, 0 = Noite
        "wind_speed_10m"         # Velocidade do vento
    ],
    "hourly": [
        "temperature_2m",            # Gráfico de temperatura
        "precipitation_probability", # Gráfico de chance de chuva (%)
        "relative_humidity_2m",      # Gráfico de umidade
        "shortwave_radiation",       # Radiação - ENERGIA SOLAR (W/m²)
        "cloud_cover"                # Cobertura de nuvens (%)
    ],
    "daily": [
        "temperature_2m_max",        # Máxima do dia
        "temperature_2m_min",        # Mínima do dia
        "uv_index_max",              # Índice UV
        "sunrise",                   # Horário do nascer do sol
        "sunset",                    # Horário do pôr do sol
        "precipitation_sum"          # Total de chuva previsto pro dia
    ]
}

def get_weather_data() -> dict | None:
    """
    Busca dados na API Open-Meteo.
    Retorna um dicionário com os dados ou None em caso de erro.
    """

    try:

        params = {
            "latitude": LAT,
            "longitude": LONG
        }

        for key, value in WEATHER_OPTIONS.items():
            if isinstance(value, list):
                params[key] = ",".join(value)
            else:
                params[key] = value

        response = requests.get(API_URL, params=params, timeout=10)

        if response.status_code != 200:
            logger.error(f" ❗️ Erro na API: {response.status_code} - {response.text}")
            return None

        data = response.json()

        logger.info(" ✅ Dados climáticos obtidos com sucesso!")
        
        data["source_city_lat"] = LAT
        data["source_city_long"] = LONG
        data["collected_at"] = datetime.now().isoformat()

        return data
    
    except requests.RequestException as e:
        logger.error(f" ❗️ Erro de conexão com a API: {e}")

        return None
    except Exception as e:
        logger.error(f" ❗️ Erro inesperado na coleta: {e}")

        return None
    
def send_to_queue(data: dict) -> None:
    """Envia os dados coletados para a fila de mensagens"""

    connection = None
    try:

        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)

        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        message = json.dumps(data)

        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,
            )
        )

        logger.info(f" ✅ Enviado dados climáticos para a fila '{QUEUE_NAME}' com sucesso!")
        
    except pika.exceptions.AMQPConnectionError as e:
        logger.error(f" ❗️ Falha ao conectar no RabbitMQ: {e}")
    except Exception as e:
        logger.error(f" ❗️ Erro genérico no envio para fila: {e}")
    finally:
        if connection and not connection.is_closed:
            connection.close()

def job():
    """Tarefa agendada para coletar e enviar dados climáticos."""
    logger.info(" 🌤️  Coletando dados climáticos...")

    weather_data = get_weather_data()

    if weather_data:
        send_to_queue(weather_data)
    else:
        logger.error(" ❗️ Nenhum dado climático disponível para enviar.")

if __name__ == "__main__":
    logger.info(f"🚀 Iniciando coletor (Alvo: {RABBITMQ_HOST})...")

    job()

    schedule.every(1).hours.do(job)

    logger.info(f" ⏱️  Aguardando {COLLECT_INTERVAL // 60} minutos para a próxima coleta...")

    while True:
        schedule.run_pending()
        time.sleep(1)