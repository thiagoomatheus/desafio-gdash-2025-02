import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Bar, 
  Line, 
  ComposedChart, 
  CartesianGrid, 
  XAxis, 
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "./ui/chart";

const chartConfig = {
  rainMm: {
    label: "Volume (mm)",
    color: "#3b82f6",
  },
  rainProb: {
    label: "Chance (%)",
    color: "#06b6d4",
  },
} satisfies ChartConfig;

interface ChartProps {
  data: any[];
}

export default function RainChart({ data }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    
    return [...data].reverse().map((item) => {
        
      const prob = item.details?.hourly?.precipitation_probability?.[0] || 0;

      return {
        time: format(parseISO(item.date), "HH:mm"),
        fullDate: format(parseISO(item.date), "dd/MM HH:mm", { locale: ptBR }),
        rainMm: item.precipitation || 0,
        rainProb: prob,
      };
    });
  }, [data]);

  return (
    <div className="w-full min-w-0 h-[300px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
              unit="mm"
              
              domain={[0, 'dataMax + 2']} 
              width={40}
              style={{ fontSize: '10px' }}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              unit="%"
              domain={[0, 100]}
              width={30}
              style={{ fontSize: '10px' }}
            />

            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={
                <ChartTooltipContent 
                  labelKey="time" 
                  indicator="dot" 
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />
            
            <Bar
              yAxisId="left"
              dataKey="rainMm"
              fill="var(--color-rainMm)"
              radius={[4, 4, 0, 0]}
              barSize={30}
              fillOpacity={0.8}
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rainProb"
              stroke="var(--color-rainProb)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--color-rainProb)" }}
              activeDot={{ r: 5 }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}