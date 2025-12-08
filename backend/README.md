# ☁️ GDASH API (Backend)

O núcleo do sistema GDASH. Uma API RESTful construída com **NestJS** responsável por gerenciar dados climáticos, usuários, autenticação e integração com Inteligência Artificial.

## 🛠️ Tecnologias

- **Framework:** NestJS (Node.js + TypeScript)
- **Database:** MongoDB (via Mongoose)
- **AI:** Google Gemini (Generative AI SDK)
- **Auth:** JWT + Passport + Bcrypt
- **Docs:** Swagger (OpenAPI)
- **Utils:** ExcelJS (Exportação), Axios (Proxy HTTP)

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz desta pasta (ou use o do Docker Compose):

```env
# Configs de Aplicação
JWT_SECRET="sua_chave_secreta_aqui"

GEMINI_API_KEY="sua_chave_de_api_aqui"
GEMINI_MODEL_NAME="modelo_exemplo"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="123456"

# URL MongoDB
DATABASE_URL="mongodb://localhost:27017/nome_do_banco_de_dados"
```

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