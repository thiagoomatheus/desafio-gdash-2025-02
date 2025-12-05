import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { PrismaClient } from '@prisma/client/extension';
import { WeatherInsightService } from './weather-insight.service';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, PrismaClient, WeatherInsightService],
})
export class WeatherModule {}
