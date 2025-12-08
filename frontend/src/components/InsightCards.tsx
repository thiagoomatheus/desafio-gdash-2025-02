import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Zap, ThermometerSun, CloudRain, Info } from "lucide-react";

interface Insight {
  type: 'energy' | 'health' | 'weather';
  level: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
}

interface InsightProps {
  insights: {
    summary?: string;
    cards: Insight[];
  } | null;
}

export default function InsightCards({ insights }: InsightProps) {
  if (!insights) return null;
  
  const styles = {
    energy: { icon: Zap, color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
    health: { icon: ThermometerSun, color: "text-red-500", bg: "bg-red-50 border-red-100" },
    weather: { icon: CloudRain, color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
    default: { icon: Info, color: "text-slate-500", bg: "bg-slate-50 border-slate-100" }
  };

  return (
    <div className="space-y-4">
      {/* Resumo da IA */}
      {insights.summary && (
        <div className="p-4 rounded-lg bg-linear-to-r from-slate-800 to-slate-900 text-slate-100 shadow-md">
          <div className="flex items-center gap-2 mb-1 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Zap size={14} /> Análise Inteligente
          </div>
          <p className="text-sm leading-relaxed opacity-90">{insights.summary}</p>
        </div>
      )}

      {/* Cards Individuais */}
      <div className="grid gap-4 md:grid-cols-3">
        {insights.cards.map((card, idx) => {
          const style = styles[card.type] || styles.default;
          const Icon = style.icon;

          return (
            <Card key={idx} className={`border ${style.bg} shadow-sm`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${style.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600 font-medium leading-snug">
                  {card.message}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}