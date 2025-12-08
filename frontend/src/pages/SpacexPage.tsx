import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';
import { type Launch } from '../types';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "../components/ui/sheet";
import { Rocket, ChevronLeft, ChevronRight, Calendar, Info, Youtube, FileText, X } from "lucide-react";

export default function SpacexPage() {
  const [page, setPage] = useState(1);

  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  
  const limit = 8;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['spacex', page],
    queryFn: async () => {
      const res = await api.get(`/spacex/launches?page=${page}&limit=${limit}`);
      return res.data;
    },
  });

  if (isError) return <div className="p-8 text-red-500">Erro ao carregar dados da SpaceX.</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">SpaceX Launches 🚀</h2>
          <p className="text-slate-500">Histórico de missões espaciais integradas via API Pública.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">Página {page}</span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setPage(p => p + 1)}
            disabled={data?.page >= data?.totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading 
          ? Array.from({ length: 8 }).map((_, i) => <LaunchSkeleton key={i} />)
          : data?.data?.map((launch: Launch) => (
            <Card key={launch.id} className="hover:shadow-lg transition-all border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group">
              
              <div className="h-40 bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
                
                 <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 
                 {launch.image ? (
                    <img src={launch.image} alt={launch.mission_name} className="h-full object-contain drop-shadow-xl z-10 transition-transform group-hover:scale-110 duration-500" />
                 ) : (
                    <Rocket className="h-16 w-16 text-slate-700" />
                 )}
                 <Badge className={`absolute top-3 right-3 ${launch.success ? 'bg-green-600' : 'bg-red-600'}`}>
                    {launch.success ? 'SUCESSO' : 'FALHA'}
                 </Badge>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="truncate text-lg" title={launch.mission_name}>
                  {launch.mission_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar size={12} />
                  {format(new Date(launch.date), "dd/MM/yyyy 'às' HH:mm")}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {launch.details || "Sem detalhes disponíveis para esta missão."}
                </p>
              </CardContent>

              <CardFooter className="pt-0">
                
                <Button 
                  variant="secondary" 
                  className="w-full text-xs h-8"
                  onClick={() => setSelectedLaunch(launch)}
                >
                  <Info size={14} className="mr-1" /> Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))
        }
      </div>

      {/* --- SHEET DE DETALHES (Painel Lateral) --- */}
      <Sheet open={!!selectedLaunch} onOpenChange={() => setSelectedLaunch(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 text-2xl">
              {selectedLaunch?.success ? (
                <Badge className="bg-green-600 hover:bg-green-700 h-6 w-6 p-0 flex items-center justify-center rounded-full">✓</Badge>
              ) : (
                <Badge className="bg-red-600 h-6 w-6 p-0 flex items-center justify-center rounded-full">✕</Badge>
              )}
              {selectedLaunch?.mission_name}
            </SheetTitle>
            <SheetDescription>
              Lançamento realizado em {selectedLaunch && format(new Date(selectedLaunch.date), "dd 'de' MMMM 'de' yyyy, HH:mm")}
            </SheetDescription>
          </SheetHeader>

          {selectedLaunch && (
            <div className="space-y-6 p-5">
              
              <div className="bg-slate-950 rounded-xl p-8 flex justify-center items-center shadow-inner">
                {selectedLaunch.image ? (
                  <img src={selectedLaunch.image} alt="Patch" className="w-48 h-48 object-contain drop-shadow-2xl" />
                ) : (
                  <Rocket className="w-32 h-32 text-slate-800" />
                )}
              </div>
              
              <div className="space-y-2">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Relatório da Missão</h4>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedLaunch.details || "Nenhum relatório oficial fornecido para esta missão."}
                  </p>
              </div>
              
              <div className="grid gap-2">
                {selectedLaunch.video_link && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href={selectedLaunch.video_link} target="_blank" rel="noreferrer">
                      <Youtube className="text-red-600" /> Assistir Lançamento
                    </a>
                  </Button>
                )}
                {selectedLaunch.article_link && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href={selectedLaunch.article_link} target="_blank" rel="noreferrer">
                      <FileText className="text-blue-600" /> Ler Artigo
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <SheetFooter className="mt-8">
             <Button variant="ghost" onClick={() => setSelectedLaunch(null)} className="w-full bg-slate-100 dark:bg-slate-800">
                Fechar
             </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  );
}

function LaunchSkeleton() {
  return (
    <div className="space-y-3 border rounded-lg p-4">
      <Skeleton className="h-32 w-full rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}