export interface WeatherPayload {
  source_city_lat: number;
  source_city_long: number;
  collected_at: string;
  
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    is_day: number;
    wind_speed_10m: number;
  };
  
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    relative_humidity_2m: number[];
    shortwave_radiation: number[];
    cloud_cover: number[];
  };
  
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
  };
}