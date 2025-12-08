import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { Download, Wind, Droplets, Sun, RefreshCw, Zap, CloudLightning, CloudSnow, CloudRain, Cloud } from "lucide-react";

import SolarChart from '../components/SolarChart';
import InsightCards from '../components/InsightCards';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import TempChart from '../components/TempChart';
import RainChart from '../components/RainChart';
import { Badge } from '../components/ui/badge';
import type { WeatherLog } from '../types';

const getWeatherIcon = (code: number) => {
  if (code <= 1) return <Cloud className="h-4 w-4 text-slate-500" />; 
  if (code <= 3) return <Sun className="h-4 w-4 text-orange-500" />;
  if (code <= 67) return <CloudRain className="h-4 w-4 text-blue-500" />;
  if (code <= 77) return <CloudSnow className="h-4 w-4 text-cyan-500" />;
  return <CloudLightning className="h-4 w-4 text-purple-500" />;
};

export default function Dashboard() {
  
  const { data: logs, isLoading, isError, refetch } = useQuery<WeatherLog[]>({
    queryKey: ['weather-logs'],
    queryFn: async () => {
      const response = await api.get('/weather/logs');
      return response.data;
    },
    refetchInterval: 60000,
  });

  const handleExport = async (type: 'csv' | 'xlsx') => {
    try {
        const response = await api.get(`/weather/export/${type}`, {
            responseType: 'blob',
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `clima_historico.${type}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success(`Download de ${type.toUpperCase()} iniciado!`);
    } catch (error) {
        toast.error("Erro ao baixar arquivo.");
    }
  };

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <div className="p-8 text-red-500">Erro ao carregar dados. O backend está rodando?</div>;
  
  const current = logs?.[0];

  return (
    <main className="space-y-6 animate-in fade-in duration-500">
      
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Visão Geral</h2>
          <p className="text-muted-foreground">
            Acompanhamento em tempo real de Paranapanema, SP
          </p>
        </div>
        <nav className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => refetch()}>
             <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
           </Button>
           <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
             <Download className="mr-2 h-4 w-4" /> CSV
           </Button>
           <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleExport('xlsx')}>
             <Download className="mr-2 h-4 w-4" /> Excel
           </Button>
        </nav>
      </header>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
            <Sun className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{current?.temp?.toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground">Sensação de {current?.feelsLike?.toFixed(1)}°C</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umidade</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{current?.humidity}%</div>
            <p className="text-xs text-muted-foreground">Relativa do ar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vento</CardTitle>
            <Wind className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{current?.wind} km/h</div>
            <p className="text-xs text-muted-foreground">Velocidade média</p>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Radiação Solar</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
               {current?.solar ? `${current.solar.toFixed(0)} W/m²` : '--'}
            </div>
            <p className="text-xs text-orange-700 font-medium">Potencial de Geração</p>
          </CardContent>
        </Card>
      </section>
      
      {current?.insights && (
         <InsightCards insights={current.insights} />
      )}
      
      <section className="grid gap-4 md:grid-cols-7">
        
        <Card className="col-span-7 lg:col-span-4 shadow-sm border-orange-100 dark:border-orange-800 w-[95vw] md:w-full">
          <CardHeader>
            <CardTitle className="text-orange-950 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500 dark:text-orange-300" />
              Potencial de Geração Solar
            </CardTitle>
            <p className="text-sm text-slate-500">
              Radiação global horizontal (W/m²) e impacto na temperatura.
            </p>
          </CardHeader>
          <CardContent className="pl-0">
            <SolarChart data={logs || []} />
          </CardContent>
        </Card>
        
        <Card className="col-span-7 lg:col-span-3 shadow-sm w-[95vw] md:w-full h-full">
          <CardHeader className="pb-3">
            <CardTitle>Monitoramento Climático</CardTitle>
            <p className="text-sm text-muted-foreground">
              Acompanhe as tendências das últimas horas.
            </p>
          </CardHeader>
          <CardContent>
            
            <Tabs defaultValue="temp" className="w-full">
              
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="temp" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" /> Temperatura
                </TabsTrigger>
                <TabsTrigger value="rain" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" /> Chuva
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="temp" className="mt-0">
                <div className="h-80 w-full border rounded-lg p-2 bg-slate-50/50 dark:bg-gray-900/50">
                  <TempChart data={logs || []} />
                </div>
                <div className="mt-4 text-xs text-center text-slate-500">
                  Variação térmica registrada na estação.
                </div>
              </TabsContent>
              
              <TabsContent value="rain" className="mt-0">
                <div className="h-80 w-full border rounded-lg p-2 bg-slate-50/50 dark:bg-gray-900/50">
                  <RainChart data={logs || []} />
                </div>
                <div className="mt-4 text-xs text-center text-slate-500">
                  Precipitação acumulada (mm) por horário.
                </div>
              </TabsContent>

            </Tabs>

          </CardContent>
        </Card>
        
        <Card className="col-span-7 shadow-sm overflow-hidden border-t-4 border-t-slate-600 w-[95vw] md:w-full">
          <CardHeader className="pb-4 border-b">
            <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
              <div>
                <CardTitle>Histórico Detalhado</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Registro completo de todas as variáveis climáticas coletadas.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
                <Download className="mr-2 h-4 w-4" /> Exportar Dados
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600">
                      <TableHead className="w-[180px]">Data / Hora</TableHead>
                      <TableHead className="text-center w-[100px]">Clima</TableHead>
                      <TableHead className="text-right">Temp. (°C)</TableHead>
                      <TableHead className="text-right">Sensação (°C)</TableHead>
                      <TableHead className="text-right">Chuva (mm)</TableHead>
                      <TableHead className="text-right">Chuva (%)</TableHead>
                      <TableHead className="text-center">Índice UV</TableHead>
                      <TableHead className="text-right font-bold text-orange-700 dark:text-orange-400">Radiação (W/m²)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs?.map((log: any) => {
                        const probChuva = log.precipitation_probability;
                        const indiceUv = log.uv;
                        const radiacao = log.solar;

                        return (
                          <TableRow key={log.id} className="group hover:bg-slate-50">
                            
                            {/* Data/Hora */}
                            <TableCell className="font-medium text-slate-700">
                              {format(log.date, "dd/MM/yyyy")}
                              <span className="ml-2 text-slate-400 font-normal">
                                {format(log.date, "HH:mm")}
                              </span>
                            </TableCell>

                            {/* Clima */}
                            <TableCell className="text-center">
                              <div className="flex justify-center p-1 bg-slate-100 rounded-md w-fit mx-auto group-hover:bg-white transition-colors">
                                {getWeatherIcon(log.condition)}
                              </div>
                            </TableCell>

                            {/* Temp */}
                            <TableCell className="text-right font-bold text-slate-700">
                              {log.temp.toFixed(1)}°
                            </TableCell>

                            {/* Sensação */}
                            <TableCell className="text-right text-slate-500">
                              {log.feelsLike.toFixed(1)}°
                            </TableCell>

                            {/* Chuva MM */}
                            <TableCell className="text-right">
                              {log.precipitation > 0 ? (
                                <span className="font-bold text-blue-600">{log.precipitation}</span>
                              ) : (
                                <span className="text-slate-300">0</span>
                              )}
                            </TableCell>

                            {/* Chuva % */}
                            <TableCell className="text-right">
                               <div className="flex items-center justify-end gap-1">
                                 {/* Barrinha visual de progresso */}
                                 <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-blue-400" 
                                     style={{ width: `${probChuva}%` }} 
                                   />
                                 </div>
                                 <span className="text-xs text-slate-500 w-8">{probChuva}%</span>
                               </div>
                            </TableCell>

                            {/* UV */}
                            <TableCell className="text-center">
                               <Badge 
                                 variant="secondary" 
                                 className={`border-0 min-w-12 justify-center ${
                                    indiceUv >= 8 ? 'bg-red-100 text-red-700' :
                                    indiceUv >= 5 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                 }`}
                               >
                                 {indiceUv.toFixed(1)}
                               </Badge>
                            </TableCell>

                            {/* Radiação */}
                            <TableCell className="text-right font-mono text-orange-700 dark:text-orange-400 font-medium bg-orange-50/30 dark:bg-gray-800">
                               {radiacao.toFixed(0)}
                            </TableCell>

                          </TableRow>
                        )
                    })}
                  </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-[120px]" />)}
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}