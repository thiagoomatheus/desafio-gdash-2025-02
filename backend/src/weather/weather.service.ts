import { Injectable } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { PrismaService } from '../prisma.service';
import { WeatherPayload } from './interfaces/weather-data.interface';
import * as ExcelJS from 'exceljs';

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

  private async getExportData() {
    return this.prisma.weatherLog.findMany({
      orderBy: { collectedAt: 'desc' },
      take: 1000,
      select: {
        collectedAt: true,
        city: true,
        temperature: true,
        humidity: true,
        precipitation: true,
        windSpeed: true,
        condition: true
      }
    });
  }

  async generateCsv(): Promise<string> {
    const data = await this.getExportData();

    const header = 'Data,Cidade,Temperatura (C),Umidade (%),Chuva (mm),Vento (km/h),Condicao\n';

    const rows = data.map(row => {
      const date = row.collectedAt.toISOString();
      return `${date},${row.city},${row.temperature},${row.humidity},${row.precipitation},${row.windSpeed},${row.condition}`;
    }).join('\n');

    return header + rows;
  }

  async generateExcel(): Promise<Buffer> {
    const data = await this.getExportData();
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Histórico de Clima');

    sheet.columns = [
      { header: 'Data/Hora', key: 'date', width: 25 },
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'Temp (°C)', key: 'temp', width: 15 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Chuva (mm)', key: 'rain', width: 15 },
      { header: 'Vento (km/h)', key: 'wind', width: 15 },
    ];

    data.forEach(item => {
      sheet.addRow({
        date: item.collectedAt,
        city: item.city,
        temp: item.temperature,
        humidity: item.humidity,
        rain: item.precipitation,
        wind: item.windSpeed,
      });
    });

    sheet.getRow(1).font = { bold: true };

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}