import { Injectable, Logger } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { PrismaService } from '../prisma.service';
import { WeatherPayload } from './interfaces/weather-data.interface';
import * as ExcelJS from 'exceljs';
import { WeatherInsightService } from './weather-insight.service';

@Injectable()
export class WeatherService {

  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private prisma: PrismaService,
    private weatherInsightService: WeatherInsightService
  ) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const data = createWeatherDto as unknown as WeatherPayload;

    const currentSolar = data.hourly.shortwave_radiation[0] || 0;

    const log = await this.prisma.weatherLog.create({
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
        solarRadiation: currentSolar,
        insights: [],
        fullData: data as any, 
      },
    });

    this.generateAndSaveInsight(log.id, data).catch(err => 
      this.logger.error(`Erro ao gerar insight em background: ${err.message}`)
    );

    return log;
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
      solar: log.solarRadiation,
      insights: log.insights,
      details: log.fullData as unknown as WeatherPayload
    }));
  }

  async findLatest() {
    return this.prisma.weatherLog.findFirst({
      orderBy: { collectedAt: 'desc' },
    });
  }

  private async generateAndSaveInsight(logId: string, data: WeatherPayload) {

    this.logger.log(`🤖 Gerando insights para o log ${logId}...`);

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const stats: {
      _avg: { temperature: number | null; humidity: number | null; windSpeed: number | null; solarRadiation: number | null };
      _max: { temperature: number | null; windSpeed: number | null; solarRadiation: number | null };
      _min: { temperature: number | null };
      _sum: { precipitation: number | null; solarRadiation: number | null };
    } = await this.prisma.weatherLog.aggregate({
      _avg: {
        temperature: true,
        humidity: true,
        windSpeed: true,
        solarRadiation: true
      },
      _max: {
        temperature: true,
        windSpeed: true,
        solarRadiation: true
      },
      _min: {
        temperature: true
      },
      _sum: {
        precipitation: true,
        solarRadiation: true
      },
      where: {
        collectedAt: { gte: yesterday }
      }
    });
    
    const insights = await this.weatherInsightService.generateInsights(data, stats);

    await this.prisma.weatherLog.update({
      where: { id: logId },
      data: { insights: insights as any }
    });
    
    this.logger.log(`✅ Insights salvos para o log ${logId}!`);
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