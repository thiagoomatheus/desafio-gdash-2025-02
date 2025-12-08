import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// UI Components
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Sun, Zap, Wind } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.email("Insira um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.email("Insira um e-mail válido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { 
    register: registerLogin, 
    handleSubmit: handleLogin, 
    formState: { errors: errorsLogin } 
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const { 
    register: registerSign, 
    handleSubmit: handleSign, 
    formState: { errors: errorsSign } 
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  async function onLogin(data: LoginForm) {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { access_token, user } = response.data;

      signIn(access_token, user);

      toast.success(`Bem-vindo de volta, ${user.name}! ☀️`);
      
      navigate('/');
    } catch (err: any) {
      const message = err.response?.status === 401 
        ? "E-mail ou senha incorretos." 
        : "Erro ao conectar com o servidor.";
        
      toast.error("Falha no Login", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(data: RegisterForm) {
    setLoading(true);
    try {
      await api.post('/users', data);
      
      const loginResponse = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      const { access_token, user } = loginResponse.data;
      
      signIn(access_token, user);
      
      toast.success(`Conta criada! Bem-vindo, ${user.name} 🚀`, {
        description: "Você já está logado no sistema."
      });
      
      navigate('/');

    } catch (err: any) {
      console.error(err);
      
      if (err.response?.status === 409) {
        toast.error("Este e-mail já está em uso.");
      } else {
        toast.error("Erro ao criar conta", {
          description: "Tente novamente mais tarde."
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full flex flex-col lg:flex-row gap-12 lg:gap-24 min-h-[700px] lg:min-h-screen justify-between lg:justify-start">
      
      <section className="bg-slate-900 lg:flex flex-col justify-between p-10 text-white relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-500 rounded-full blur-[100px]" />
           <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px]" />
        </div>

        <header className="z-10 flex items-center gap-2 font-bold text-2xl">
          <div className="bg-orange-500 p-1 rounded-lg">
            <Sun className="text-white" />
          </div>
          GDASH
        </header>

        <div className="hidden lg:block z-10 max-w-md space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            O futuro da energia é <span className="text-orange-500">inteligente</span>.
          </h1>
          <p className="text-slate-300 text-lg">
            Monitore a geração fotovoltaica, receba insights climáticos via IA e otimize sua produção de energia renovável.
          </p>
          <div className="flex gap-4 mt-8 opacity-70">
            <div className="flex items-center gap-2"><Zap size={18} /> Monitoramento Real-time</div>
            <div className="flex items-center gap-2"><Wind size={18} /> Previsão Climática</div>
          </div>
        </div>

        <footer className="hidden lg:block z-10 text-sm text-slate-500">
          © 2025 GDASH Energy Systems. Processo Seletivo.
        </footer>
      </section>

      {/* --- LADO DIREITO (Formulário) --- */}
      <div className="flex items-center justify-center">
        <div className="mx-auto w-full max-w-[400px] lg:w-[400px] space-y-6">
          
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">Acesse sua conta</h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o dashboard.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" className="cursor-pointer">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="cursor-pointer">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Use seu e-mail e senha cadastrados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleLogin(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email" 
                        placeholder="admin@example.com" 
                        {...registerLogin('email')} 
                      />
                      {errorsLogin.email && <span className="text-red-500 text-xs">{errorsLogin.email.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        {...registerLogin('password')} 
                      />
                      {errorsLogin.password && <span className="text-red-500 text-xs">{errorsLogin.password.message}</span>}
                    </div>
                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Novo Cadastro</CardTitle>
                  <CardDescription>Crie sua conta para começar a monitorar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSign(onRegister)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nome Completo</Label>
                      <Input id="reg-name" placeholder="Seu nome" {...registerSign('name')} />
                      {errorsSign.name && <span className="text-red-500 text-xs">{errorsSign.name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">E-mail</Label>
                      <Input id="reg-email" placeholder="seu@email.com" {...registerSign('email')} />
                      {errorsSign.email && <span className="text-red-500 text-xs">{errorsSign.email.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-pass">Senha</Label>
                      <Input id="reg-pass" type="password" placeholder="Mínimo 6 caracteres" {...registerSign('password')} />
                      {errorsSign.password && <span className="text-red-500 text-xs">{errorsSign.password.message}</span>}
                    </div>
                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                      {loading ? 'Criando...' : 'Criar Conta'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>

      <footer className="lg:hidden text-sm text-slate-500 self-center">
        © 2025 GDASH Energy Systems. Processo Seletivo.
      </footer>
    </main>
  );
}