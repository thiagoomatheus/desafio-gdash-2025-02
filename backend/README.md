# ☁️ GDASH API (Backend)

O núcleo do sistema GDASH. Uma API RESTful construída com **NestJS** responsável por gerenciar dados climáticos, usuários, autenticação e integração com Inteligência Artificial.

## 🛠️ Tecnologias

- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** MongoDB (via Mongoose)
- **AI:** Google Gemini (Generative AI SDK)
- **Auth:** JWT + Passport + Bcrypt
- **Docs:** Swagger (OpenAPI)
- **Utils:** ExcelJS (Exportação), Axios (Proxy HTTP)

## ⚙️ Configuração

Este serviço foi configurado para ler as variáveis de ambiente diretamente do arquivo `.env` localizado na **raiz do monorepo** (`../.env`). Não é necessário criar um arquivo `.env` dentro desta pasta.

## 🚀 Como Rodar

### Via Docker (Recomendado)
Este serviço é orquestrado pelo `compose.yml` na raiz do projeto.

### Manualmente (Desenvolvimento)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie em modo watch:
   ```bash
   npm run start:dev
   ```

3. Acesse a documentação Swagger:
   - [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## ✨ Funcionalidades Principais

- **Ingestão de Dados:** Recebe logs do Worker Go via `POST /api/weather/logs`.
- **Inteligência Solar:** Calcula a geração acumulada de energia e usa o Gemini para gerar insights textuais.
- **Segurança:** Implementa Roles (Admin/User) e Soft Delete.
- **Proxy:** Consome a API da SpaceX para o frontend.