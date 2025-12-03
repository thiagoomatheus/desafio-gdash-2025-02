import { Injectable } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { PrismaService } from '../prisma.service';
import { WeatherPayload } from './interfaces/weather-data.interface';

@Injectable()
export class WeatherService {
  constructor(private prisma: PrismaService) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const data = createWeatherDto as unknown as WeatherPayload;

    return this.prisma.weatherLog.create({
      data: {
        latitude: data.source_city_lat,
        longitude: data.source_city_long,
        collectedAt: new Date(data.collected_at),
        city: "Paranapanema",
        temperature: data.current.temperature_2m,
        condition: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        apparentTemperature: data.current.apparent_temperature,
        precipitation: data.current.precipitation,
        isDay: data.current.is_day === 1,
        windSpeed: data.current.wind_speed_10m,
        fullData: data as any, 
      },
    });
  }

  async findAll() {
    const logs = await this.prisma.weatherLog.findMany({
      orderBy: { collectedAt: 'desc' },
      take: 20,
    });

    return logs.map(log => ({
      id: log.id,
      date: log.collectedAt,
      city: log.city,
      temp: log.temperature,
      condition: log.condition,
      humidity: log.humidity,
      feelsLike: log.apparentTemperature,
      precipitation: log.precipitation,
      isDay: log.isDay,
      wind: log.windSpeed,
      details: log.fullData as unknown as WeatherPayload
    }));
  }
}