import { Injectable, Logger } from '@nestjs/common';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherPayload } from './interfaces/weather-data.interface';
import * as ExcelJS from 'exceljs';
import { WeatherInsightService } from './weather-insight.service';
import { WeatherLog } from './schemas/weather-log.schema';

@Injectable()
export class WeatherService {

  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectModel(WeatherLog.name) private weatherModel: Model<WeatherLog>,
    private weatherInsightService: WeatherInsightService
  ) {}

  async create(createWeatherDto: CreateWeatherDto) {
    const data = createWeatherDto as unknown as WeatherPayload;

    const currentSolar = data.hourly.shortwave_radiation[0] || 0;

    const log = new this.weatherModel({
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
      fullData: data as any
    });

    const saved = await log.save();

    this.generateAndSaveInsight(saved._id.toString(), data).catch(err => 
      this.logger.error(`Erro ao gerar insight em background: ${err.message}`)
    );

    return saved;
  }

  async findAll() {
    const logs = await this.weatherModel.find().sort({ collectedAt: -1 }).limit(20).exec();

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
    return this.weatherModel.findOne().sort({ collectedAt: -1 }).exec();
  }

  private async generateAndSaveInsight(logId: string, data: WeatherPayload) {

    this.logger.log(`🤖 Gerando insights para o log ${logId}...`);

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const result = await this.weatherModel.aggregate([
      { $match: { collectedAt: { $gte: yesterday } } },
      {
        $group: {
          _id: null,

          avgTemp: { $avg: "$temperature" },
          avgHum: { $avg: "$humidity" },
          avgWind: { $avg: "$windSpeed" },
          avgSolar: { $avg: "$solarRadiation" },
        
          maxTemp: { $max: "$temperature" },
          maxWind: { $max: "$windSpeed" },
          maxSolar: { $max: "$solarRadiation" },
          
          minTemp: { $min: "$temperature" },
          
          sumRain: { $sum: "$precipitation" },
          sumSolar: { $sum: "$solarRadiation" }
        }
      }
    ]);

    const stats = result[0] || {}

    const statsFormatted: {
      _avg: { temperature: number | null; humidity: number | null; windSpeed: number | null; solarRadiation: number | null };
      _max: { temperature: number | null; windSpeed: number | null; solarRadiation: number | null };
      _min: { temperature: number | null };
      _sum: { precipitation: number | null; solarRadiation: number | null };
    } = {
      _avg: {
        temperature: stats.avgTemp || null,
        humidity: null,
        windSpeed: null,
        solarRadiation: stats.totalSolar ? stats.totalSolar / 24 : null
      },
      _max: {
        temperature: stats.maxTemp || null,
        windSpeed: null,
        solarRadiation: stats.maxSolar || null
      },
      _min: {
        temperature: stats.minTemp || null
      },
      _sum: {
        precipitation: stats.totalRain || null,
        solarRadiation: stats.totalSolar || null
      }
    };
    
    const insights = await this.weatherInsightService.generateInsights(data, statsFormatted);

    await this.weatherModel.findByIdAndUpdate(logId, { insights: insights });
    
    this.logger.log(`✅ Insights salvos para o log ${logId}!`);
  }

  private async getExportData() {
    return this.weatherModel
      .find()
      .sort({ collectedAt: -1 })
      .limit(1000)
      .select({
        collectedAt: 1,
        city: 1,
        temperature: 1,
        humidity: 1,
        precipitation: 1,
        windSpeed: 1,
        condition: 1,
        _id: 0
      })
      .exec();
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