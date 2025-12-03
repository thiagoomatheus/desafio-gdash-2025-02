import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { PrismaClient } from '@prisma/client/extension';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, PrismaClient],
})
export class WeatherModule {}
