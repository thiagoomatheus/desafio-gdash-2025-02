import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/ui/chart";

const chartConfig = {
  temp: {
    label: "Temperatura",
    color: "#8b5cf6"
  },
} satisfies ChartConfig;

interface ChartProps {
  data: any[];
}

export default function TempChart({ data }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    return [...data].reverse().map((item) => ({
      time: format(parseISO(item.date), "HH:mm"),
      fullDate: format(parseISO(item.date), "dd/MM HH:mm", { locale: ptBR }),
      temp: item.temp,
    }));
  }, [data]);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
            <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-temp)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-temp)" stopOpacity={0.1} />
            </linearGradient>
        </defs>
        
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
        
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        
        <YAxis 
            tickLine={false} 
            axisLine={false} 
            domain={['dataMin - 2', 'dataMax + 2']}
            unit="°C"
            width={40}
        />

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelKey="time" indicator="dot" />}
        />

        <Area
          dataKey="temp"
          type="natural"
          fill="url(#fillTemp)"
          fillOpacity={0.4}
          stroke="var(--color-temp)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}