import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'sonner';

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

const userSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal('')),
});

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: any;
}

export default function UserDialog({ isOpen, onClose, userToEdit }: UserDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(userSchema)
  });
  
  useEffect(() => {
    if (userToEdit) {
      setValue('name', userToEdit.name);
      setValue('email', userToEdit.email);
      setValue('password', '');
    } else {
      reset({ name: '', email: '', password: '' });
    }
  }, [userToEdit, isOpen]);

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      if (userToEdit) {

        const userId = userToEdit.id || userToEdit._id;

        // Edição (PATCH)
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        
        await api.patch(`/users/${userId}`, payload);
        toast.success("Usuário atualizado!");
      } else {
        // Criação (POST)
        if (!data.password) {
            toast.error("Senha é obrigatória para criar usuário.");
            setLoading(false);
            return;
        }
        await api.post('/users', data);
        toast.success("Usuário criado!");
      }
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    } catch (err) {
      toast.error("Erro ao salvar usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{userToEdit ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input {...register('name')} />
            {errors.name && <span className="text-red-500 text-xs">{String(errors.name.message)}</span>}
          </div>
          <div>
            <Label>Email</Label>
            <Input {...register('email')} disabled={!!userToEdit} />
            {errors.email && <span className="text-red-500 text-xs">{String(errors.email.message)}</span>}
          </div>
          <div>
            <Label>Senha {userToEdit && '(Deixe em branco para manter)'}</Label>
            <Input type="password" {...register('password')} />
            {errors.password && <span className="text-red-500 text-xs">{String(errors.password.message)}</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}