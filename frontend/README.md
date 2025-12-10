# ☀️ GDASH Dashboard (Frontend)

A interface do usuário do sistema GDASH. Uma Single Page Application (SPA) moderna, focada em visualização de dados e experiência do usuário (UX).

## 🛠️ Tecnologias

- **Core:** React + Vite (TypeScript)
- **Estilização:** Tailwind CSS + Shadcn UI
- **Estado/Cache:** TanStack Query (React Query)
- **Gráficos:** Recharts
- **Forms:** React Hook Form + Zod
- **Ícones:** Lucide React

## ⚙️ Configuração

Este projeto foi configurado (`vite.config.ts`) para ler as variáveis de ambiente do arquivo `.env` localizado na **raiz do monorepo**.

A variável principal é:
```ini
VITE_API_URL="http://localhost:3000/api"
```

## 🚀 Como Rodar

### Via Docker
O frontend é servido via **serve** (Node.js static server) dentro do container na porta `5173`.

### Manualmente (Desenvolvimento)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse: [http://localhost:5173](http://localhost:5173)

## 🎨 Destaques de UX

- **Dark Mode:** Tema claro/escuro persistente.
- **Gráficos Híbridos:** Visualização combinada de temperatura e radiação solar.
- **Responsividade:** Layout adaptável para Mobile (Menu Sheet) e Desktop (Sidebar).
- **Feedback:** Toasts (Sonner) para ações de sucesso/erro.