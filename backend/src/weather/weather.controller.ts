import { Controller, Get, Post, Body } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

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
}