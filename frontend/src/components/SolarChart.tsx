import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Area, 
  Line, 
  ComposedChart, 
  CartesianGrid, 
  XAxis, 
  YAxis,
  ResponsiveContainer
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const chartConfig = {
  temp: {
    label: "Temperatura (°C)",
    color: "#3b82f6"
  },
  solar: {
    label: "Radiação Solar (W/m²)",
    color: "#f97316"
  },
} satisfies ChartConfig;

interface ChartProps {
  data: any[];
}

export default function SolarChart({ data }: ChartProps) {
  
  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data].reverse().map((item) => ({
      time: format(parseISO(item.date), "HH:mm"),
      fullDate: format(parseISO(item.date), "dd/MM HH:mm", { locale: ptBR }),
      temp: item.temp,
      solar: item.solar || 0,
    }));
  }, [data]);

  return (
    <div className="w-full min-w-0">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            accessibilityLayer 
            data={chartData}
            margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.5} />
            
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            
            <YAxis 
              yAxisId="left"
              orientation="left"
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              hide 
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              hide
            />
            
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  labelKey="time" 
                  indicator="dot" 
                />
              }
            />
            
            <ChartLegend content={<ChartLegendContent />} />
            
            <defs>
              <linearGradient id="fillSolar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-solar)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-solar)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <Area
              yAxisId="right"
              dataKey="solar"
              type="monotone"
              fill="url(#fillSolar)"
              fillOpacity={0.4}
              stroke="var(--color-solar)"
              strokeWidth={2}
              stackId="a"
            />
            
            <Line
              yAxisId="left"
              dataKey="temp"
              type="monotone"
              stroke="var(--color-temp)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}