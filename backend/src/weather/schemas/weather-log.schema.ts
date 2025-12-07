import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WeatherLogDocument = HydratedDocument<WeatherLog>;

@Schema()
export class WeatherLog {
  @Prop() latitude: number;
  @Prop() longitude: number;
  @Prop({ default: Date.now }) collectedAt: Date;
  @Prop({ default: 'Paranapanema' }) city: string;

  @Prop() temperature: number;
  @Prop() condition: number;
  @Prop() humidity: number;
  @Prop() apparentTemperature: number;
  @Prop() precipitation: number;
  @Prop() isDay: boolean;
  @Prop() windSpeed: number;
  @Prop({ default: 0 }) solarRadiation: number;

  @Prop({ type: Object }) insights: any;
  @Prop({ type: Object }) fullData: any;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);