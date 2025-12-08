export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface WeatherLog {
  id: string;
  date: string;
  city: string;
  temp: number;
  condition: number;
  humidity: number;
  feelsLike: number;
  precipitation: number;
  isDay: boolean;
  wind: number;
  solar: number;
  cloud: number;
  uv: number;
  precipitation_probability: number;

  insights?: {
    summary: string;
    cards: {
    type: 'energy' | 'health' | 'weather';
    level: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    }[];
  };
  
  details?: any; 
}

export interface Launch {
  id: string;
  mission_name: string;
  date: string;
  success: boolean;
  details: string;
  image: string | null;
  video_link?: string;
  article_link?: string;
}

export interface SpaceXResponse {
  docs: Launch[];
  data: Launch[];
  total: number;
  page: number;
  totalPages: number;
}