import { Injectable, Logger } from '@nestjs/common';
import { WeatherPayload } from './interfaces/weather-data.interface';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class WeatherInsightService {
  private readonly logger = new Logger(WeatherInsightService.name);
  
  private aiClient: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY não definida. Insights de IA estarão desativados.');
      return;
    }

    if (apiKey) {
      this.aiClient = new GoogleGenAI({ apiKey });
    }

  }

  async generateInsights(data: WeatherPayload, stats: {
    _avg: { temperature: number | null; humidity: number | null; windSpeed: number | null; solarRadiation: number | null };
    _max: { temperature: number | null; windSpeed: number | null; solarRadiation: number | null };
    _min: { temperature: number | null };
    _sum: { precipitation: number | null; solarRadiation: number | null };
  }) {
    if (!this.aiClient) {
      this.logger.warn('GEMINI_API_KEY ausente.');
      return this.getFallbackInsights();
    }

    const tomorrow = {
      temp_max: data.daily.temperature_2m_max[1],
      temp_min: data.daily.temperature_2m_min[1],
      rain_sum: data.daily.precipitation_sum[1],
      uv_max: data.daily.uv_index_max[1]
    };

    const index = new Date(data.collected_at).getHours();

    const contextData = {
      city: "Paranapanema, SP",
      current: {
        temp: data.current.temperature_2m,
        rain: data.current.precipitation,
        uv: data.hourly.uv_index[index] || 0,
        solar: data.hourly.shortwave_radiation_instant[index] || 0,
        precipitation_probability: data.hourly.precipitation_probability[index] || 0,
        cloud_cover: data.current.cloud_cover || 0,
      },
      history_24h: stats,
      tomorrow: tomorrow
    };

    const prompt = `
      Atue como meteorologista especialista em Energia Solar da GDASH.
      Analise os dados: ${JSON.stringify(contextData)}
      
      Gere (JSON):
      1. "summary": Um resumo conciso (2-3 frases) sobre o clima atual, tendências para as próximas horas e impacto para a saúde.
      2. "cards": Array com 3 cards:
         - [Solar]: Analise o 'acumulado_solar' e 'sol_atual'. Diga se a geração foi Alta, Média ou Baixa.
         - [Clima]: Tendência de temperatura/chuva.
         - [Saúde]: Risco UV ou Conforto Térmico.

      Output JSON puro: { "summary": string, "cards": [{ "type": "energy"|"weather"|"health", "level": "success"|"warning"|"danger", "title": string, "message": string }] }
    `;

    try {
      const response = await this.aiClient.models.generateContent({
        model: process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash-lite",
        config: {
            responseMimeType: 'application/json',
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (!response.text) {
        this.logger.error('Resposta vazia da API Gemini.');
        return this.getFallbackInsights();
      }

      const jsonText = response.text;
      const insights = JSON.parse(jsonText);
      
      return insights;

    } catch (error) {
      this.logger.error('Falha ao gerar insights', error);
      return this.getFallbackInsights();
    }
  }

  private getFallbackInsights() {
    return {
      summary: "Análise indisponível.",
      cards: []
    };
  }
}