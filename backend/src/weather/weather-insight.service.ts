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

    const contextData = {
      city: "Paranapanema, SP",
      current: {
        temp: data.current.temperature_2m,
        rain: data.current.precipitation,
        uv: data.daily.uv_index_max[0] || 0,
        solar: data.hourly.shortwave_radiation.slice(0, 6)
      },
      history_24h: stats
    };

    const prompt = `
      Atue como meteorologista especialista em Energia Solar da GDASH.
      Analise os dados: ${JSON.stringify(contextData)}
      
      Gere (JSON):
      1. "summary": Resumo de 1 frase comparando agora com a média de 24h.
      2. "cards": Array com 3 cards:
         - [Solar]: Analise o 'acumulado_solar' e 'sol_atual'. Diga se a geração foi Alta, Média ou Baixa.
         - [Clima]: Tendência de temperatura/chuva.
         - [Saúde]: Risco UV ou Conforto Térmico.

      Output JSON puro: { "summary": string, "cards": [{ "type": "energy"|"weather"|"health", "level": "success"|"warning"|"danger", "title": string, "message": string }] }
    `;

    try {
      const response = await this.aiClient.models.generateContent({
        model: 'gemini-flash-lite-latest',
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