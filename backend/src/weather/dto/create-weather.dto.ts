import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested, IsOptional } from 'class-validator';

class CurrentWeatherDto {
  @ApiProperty({ description: 'Temperatura atual (°C)', example: 25.4 })
  @IsNumber()
  temperature_2m: number;

  @ApiProperty({ description: 'Umidade relativa (%)', example: 60 })
  @IsNumber()
  relative_humidity_2m: number;

  @ApiProperty({ description: 'Sensação térmica (°C)', example: 27.0 })
  @IsNumber()
  apparent_temperature: number;

  @ApiProperty({ description: 'Precipitação (mm)', example: 0.0 })
  @IsNumber()
  precipitation: number;

  @ApiProperty({ description: 'Código WMO do clima', example: 1 })
  @IsNumber()
  weather_code: number;

  @ApiProperty({ description: 'Informa se é dia ou noite (1 = Dia | 0 = Noite)', example: 1 })
  @IsNumber()
  is_day: number;

  @ApiProperty({ description: 'Velocidade do vento (Km/h)', example: 12.5 })
  @IsNumber()
  wind_speed_10m: number;
}

class HourlyWeatherDto {
  @ApiProperty({ description: 'Lista de horários ISO', example: ['2025-11-30T10:00'] })
  @IsArray()
  @IsString({ each: true })
  time: string[];

  @ApiProperty({ description: 'Temperatura relativo ao horário (°C) ', example: [25.1, 26.2] })
  @IsArray()
  @IsNumber({}, { each: true })
  temperature_2m: number[];

  @ApiProperty( { description: 'Probabilidade de chuva relativo ao horário (%)', example: [10, 20] })
  @IsArray()
  @IsNumber({}, { each: true })
  precipitation_probability: number[];

  @ApiProperty({ description: 'Umidade relativa relativo ao horário (%)', example: [15.0, 18.5] })
  @IsArray()
  @IsNumber({}, { each: true })
  relative_humidity_2m: number[];

  @ApiProperty({ description: 'Radiação solar relativo ao horário (W/m²)' })
  @IsArray()
  @IsNumber({}, { each: true })
  shortwave_radiation: number[];

  @ApiProperty( { description: 'Cobertura de nuvens relativo ao horário (%)', example: [20, 30] })
  @IsArray()
  @IsNumber({}, { each: true })
  cloud_cover: number[];
}

class DailyWeatherDto {
  @ApiProperty({ description: 'Data', example: ['2024-05-20'] })
  @IsArray()
  @IsString({ each: true })
  time: string[];

  @ApiProperty({ description: 'Temperatura máxima do dia (°C)', example: [30.5, 28.4] })
  @IsArray()
  @IsNumber({}, { each: true })
  temperature_2m_max: number[];

  @ApiProperty({ description: 'Temperatura mínima do dia (°C)', example: [20.1, 19.5] })
  @IsArray()
  @IsNumber({}, { each: true })
  temperature_2m_min: number[];

  @ApiProperty({ description: 'Índice UV máximo do dia', example: [7, 6] })
  @IsArray()
  @IsNumber({}, { each: true })
  uv_index_max: number[];

  @ApiProperty({ description: 'Hora do nascer do sol', example: ['06:12', '06:15'] })
  @IsArray()
  @IsString({ each: true })
  sunrise: string[];

  @ApiProperty({ description: 'Hora do pôr do sol', example: ['18:45', '18:42'] })
  @IsArray()
  @IsString({ each: true })
  sunset: string[];

  @ApiProperty({ description: 'Soma da precipitação do dia (mm)', example: [5.0, 0.0] })
  @IsArray()
  @IsNumber({}, { each: true })
  precipitation_sum: number[];
}


export class CreateWeatherDto {
  @ApiProperty({ description: 'Latitude da cidade coletada', example: -23.55 })
  @IsNumber()
  source_city_lat: number;

  @ApiProperty({ description: 'Longitude da cidade coletada', example: -46.63 })
  @IsNumber()
  source_city_long: number;

  @ApiProperty({ description: 'Data da coleta em ISO', example: '2025-11-30T14:00:00.000Z' })
  @IsString()
  collected_at: string;

  @ApiProperty({ type: CurrentWeatherDto })
  @ValidateNested()
  @Type(() => CurrentWeatherDto)
  current: CurrentWeatherDto;

  @ApiProperty({ type: HourlyWeatherDto })
  @ValidateNested()
  @Type(() => HourlyWeatherDto)
  hourly: HourlyWeatherDto;

  @ApiProperty({ type: DailyWeatherDto })
  @ValidateNested()
  @Type(() => DailyWeatherDto)
  daily: DailyWeatherDto;
}