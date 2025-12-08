import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { type User } from '../types';

import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Plus, Trash2, Edit, Shield, User as UserIcon } from "lucide-react";
import UserDialog from '../components/UserDialog';

const ADMIN_EMAIL = "admin@example.com";

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success("Usuário removido com sucesso.");
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error("Erro ao remover usuário", {
        description: err.response?.data?.message || "Tente novamente mais tarde."
      });
    }
  });

  function handleEdit(user: User) {
    setUserToEdit(user);
    setIsDialogOpen(true);
  }

  function handleCreate() {
    setUserToEdit(null);
    setIsDialogOpen(true);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-200">Gerenciar Usuários</h2>
          <p className="text-slate-500">Controle de acesso e permissões do sistema.</p>
        </div>
        <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>Lista de todos os membros com acesso ao painel.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead className="hidden md:table-cell">Data de Cadastro</TableHead>
                <TableHead className="text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6} className="h-16 text-center text-slate-400">Carregando...</TableCell></TableRow>
                ))
              ) : users?.map((u) => {
                const isRoot = u.email === ADMIN_EMAIL;
                const isAdmin = u.role === 'ADMIN';

                return (
                  <TableRow key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Avatar */}
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${u.name}&background=random`} />
                        <AvatarFallback>{u.name.substring(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Nome */}
                    <TableCell className="font-medium text-slate-700">
                      {u.name}
                      {isRoot && <span className="ml-2 text-[10px] text-slate-400 font-normal">(Você)</span>}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-slate-500">{u.email}</TableCell>

                    {/* Role Badge */}
                    <TableCell>
                      <Badge 
                        variant={isAdmin ? "default" : "secondary"}
                        className={`gap-1 font-normal ${
                          isAdmin 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {isAdmin ? <Shield size={12} /> : <UserIcon size={12} />}
                        {u.role || 'USER'}
                      </Badge>
                    </TableCell>

                    {/* Data */}
                    <TableCell className="hidden md:table-cell text-slate-500 text-xs">
                      {u.createdAt ? format(new Date(u.createdAt), "dd 'de' MMM, yyyy") : '-'}
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1">
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEdit(u)}
                          disabled={isRoot}
                          title={isRoot ? "Usuário do sistema protegido" : "Editar"}
                        >
                          <Edit className={`h-4 w-4 ${isRoot ? 'text-slate-300' : 'text-blue-600'}`} />
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if(!isRoot && confirm(`Tem certeza que deseja remover ${u.name}?`)) {
                              deleteMutation.mutate(u.id || u._id || '');
                            }
                          }}
                          disabled={isRoot}
                          title={isRoot ? "Impossível remover Root" : "Remover"}
                        >
                          <Trash2 className={`h-4 w-4 ${isRoot ? 'text-slate-300' : 'text-red-500'}`} />
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        userToEdit={userToEdit} 
      />
    </div>
  );
}