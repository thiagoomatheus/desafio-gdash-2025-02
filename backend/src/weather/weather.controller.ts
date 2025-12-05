import { Controller, Get, Post, Body, Res, NotFoundException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { WeatherInsightService } from './weather-insight.service';
import { WeatherPayload } from './interfaces/weather-data.interface';

@Controller('api/weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly insightService: WeatherInsightService
  ) {}

  @Post('logs')
  @ApiOperation({ summary: 'Recebe logs do Worker Go' })
  @ApiResponse({ status: 201, description: 'Log salvo com sucesso.' })
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Lista histórico para o Dashboard' })
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Baixar histórico em CSV' })
  async exportCsv(@Res() res: Response) {
    const csvString = await this.weatherService.generateCsv();

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="clima_historico.csv"',
    });

    res.send(csvString);
  }

  @Get('export/xlsx')
  @ApiOperation({ summary: 'Baixar histórico em Excel' })
  async exportExcel(@Res() res: Response) {
    const buffer = await this.weatherService.generateExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="clima_historico.xlsx"',
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Retorna os insights mais recentes gerados pela IA (Gemini)' })
  async getInsights() {
    const latestLog = await this.weatherService.findLatest();

    if (!latestLog) {
      throw new NotFoundException('Nenhum dado climático encontrado para gerar insights.');
    }

    if (latestLog.insights) {
      return latestLog.insights;
    }
    
    return {
      summary: "Processando análise inteligente...",
      cards: []
    };
  }
}