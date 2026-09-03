# Cine Mágico

Aplicação de catálogo de filmes com autenticação desacoplada, favoritos, comentários e integração com a TMDB.

## Acesso em produção

https://cleiton-souza-isw055.lapps.studio/login

## Desenvolvido por
@cleitongrodrigues

## Professor

[github.com/siriani](https://github.com/siriani)

## Repositório

Projeto público e organizado para execução local e em container.

## Histórico de Atividades

### Atividade 2 - Catálogo de Filmes (Monólito)
Implementação de uma aplicação monolítica com login, cadastro, catálogo de filmes, favoritos e comentários em um único container.

### Atividade 3 - Microsserviço de Autenticação ✨ NOVO
Desacoplamento da lógica de autenticação em um microsserviço separado, acessível apenas internamente via Docker network.

## Funcionalidades

- ✅ Cadastro e login de usuários reais
- ✅ Catálogo de filmes com dados da TMDB
- ✅ Favoritar filmes por usuário
- ✅ Adicionar e visualizar comentários
- ✅ **Recuperação de senha com link expiável (30 minutos)** ✨ NOVO
- ✅ Papéis de usuário (role) com RBAC no backend ✨ NOVO
- ✅ Microsserviço de autenticação desacoplado ✨ NOVO
- ✅ Persistência em banco MySQL/MariaDB
- ✅ Execução em Docker com múltiplos containers

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express (API Catalog)
- Auth Service: Node.js + Express (Microsserviço de Autenticação) ✨ NOVO
- Banco: MySQL/MariaDB (compartilhado)
- Email: Mailtrap (Desenvolvimento) / Brevo (Produção) ✨ NOVO
- Containerização: Docker + Docker Compose

## Arquitetura

A partir da Atividade 3, a aplicação segue uma arquitetura de microsserviços:

```
┌─────────────┐
│   Frontend  │ (porta 8201 - público)
│   React     │
└─────────────┘
       ↓ HTTPS (public)
┌──────────────────────────────────────────────┐
│  Backend Cine Mágico (porta 3000 - público)  │
│  ├─ Login/Logout (proxy para auth-service)   │
│  ├─ Catálogo de filmes                       │
│  ├─ Favoritos                                │
│  └─ Comentários                              │
└──────────────────────────────────────────────┘
       ↓ HTTP (rede interna Docker)
┌────────────────────────────────────────────────────────┐
│  Auth Service (porta 3001 - INTERNA APENAS)            │
│  ├─ Cadastro e autenticação                           │
│  ├─ Validação de tokens JWT                           │
│  ├─ Recuperação de senha com link expiável            │
│  ├─ Papéis de usuário (role)                          │
│  └─ Integração com Mailtrap/Brevo                     │
└────────────────────────────────────────────────────────┘
       ↓ TCP (rede interna Docker)
┌────────────────────────────────┐
│  MariaDB                        │
│  ├─ Tabela: usuarios            │
│  ├─ Tabela: reset_tokens        │
│  ├─ Tabela: favoritos           │
│  └─ Tabela: comentarios         │
└────────────────────────────────┘
```

**Características principais:**
- ✅ Auth Service não expõe porta para o host (isolado internamente)
- ✅ Comunicação inter-serviços via Docker network
- ✅ Banco de dados compartilhado pelos dois serviços
- ✅ Frontend continua vendo apenas o Backend (API pública)
- ✅ Email de recuperação de senha com link que expira em 30 minutos
- ✅ Cada usuário tem um role (papel) para controle de acesso real no servidor

## Controle de Acesso por Papel (RBAC)

O projeto agora usa RBAC de verdade no backend. O cliente pode até esconder ou mostrar botões, mas a decisão final sempre acontece no servidor com base em `req.user.role`, preenchido após a validação do token pelo auth-service.

### Permissões por papel

**`usuario` pode:**
- Fazer cadastro e login
- Consultar o catálogo de filmes
- Adicionar e remover favoritos próprios
- Criar comentários
- Listar os próprios comentários
- Apagar apenas os próprios comentários

**`admin` pode fazer tudo que `usuario` faz, e além disso:**
- Apagar comentário de qualquer usuário (moderação)
- Listar todos os comentários para identificar conteúdo a moderar

### Ação exclusiva de admin implementada

A ação exclusiva escolhida foi **moderação de comentários**.

- `DELETE /api/comments/:id`
- Se o comentário pertence ao usuário autenticado: exclusão permitida
- Se o usuário autenticado tem `role = admin`: exclusão permitida, mesmo sendo comentário de outra pessoa
- Se o comentário existe, mas o usuário comum tenta apagar comentário alheio: resposta `403 Forbidden`
- Se o comentário não existe: resposta `404 Not Found`

### Onde o enforcement acontece

O enforcement está no backend, nunca no frontend.

1. O backend recebe o token Bearer
2. O middleware chama o auth-service em `/api/auth/verify-token`
3. O auth-service valida o JWT e recarrega `id`, `email` e `role` atuais do banco
4. O backend decide se a ação é permitida com base no usuário autenticado e no `role`

Isso garante que mudar o papel de um usuário no banco passa a valer na próxima requisição, sem depender de esconder botões na interface.

## Padrão de Arquitetura de Autorização

### Padrão usado hoje: Padrão A, enforcement centralizado

O projeto usa o **Padrão A**. O backend consulta o auth-service em toda rota protegida para validar o token e obter os dados atuais do usuário, incluindo a `role`. A autorização é decidida no servidor da aplicação, mas com a identidade confirmada por uma chamada de rede ao auth-service.

### O que mudaria no Padrão B (claims no JWT)

Se a aplicação migrasse para o **Padrão B**, o backend deixaria de consultar o auth-service a cada requisição e passaria a validar/decodificar o JWT localmente, lendo a `role` direto das claims do token. Isso reduziria a latência e o acoplamento de rede, mas uma mudança de papel não teria efeito imediato: o usuário continuaria com a role antiga até o token expirar e ser renovado.

## Rodar localmente

### Pré-requisitos

- Docker e Docker Compose instalados
- Conta no Mailtrap (desenvolvimento) - https://mailtrap.io
- Chave de API TMDB - https://www.themoviedb.org/settings/api

### Instruções

1. Clone o projeto

```bash
git clone https://github.com/seu-usuario/Filmes.git
cd Filmes
```

2. Crie um arquivo `.env` na raiz com as variáveis necessárias (veja abaixo)

3. Obtenha credenciais no Mailtrap:
   - Acesse https://mailtrap.io
   - Crie uma conta gratuita
   - Vá para "Sending Domain" ou "Email Sending"
   - Copie as credenciais SMTP

4. Execute os containers:

```bash
docker compose up --build
```

5. Acesse no navegador:

```text
http://localhost:8201
```

6. Para usar recuperação de senha:
   - Na tela de login, clique em "Esqueci minha senha"
   - Digite seu email cadastrado
   - Verifique os emails recebidos no Mailtrap
   - Clique no link de recuperação (válido por 30 minutos)
   - Defina uma nova senha

## Variáveis de ambiente

Arquivo `.env` na raiz do projeto:

```env
# Backend Catálogo
PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001

# Auth Service
AUTH_SERVICE_PORT=3001

# Banco de Dados (compartilhado)
DB_HOST=mariadb
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=cine_magico
DB_DIALECT=mysql

# JWT
JWT_SECRET=seu-secret-key-muito-seguro-aqui-2024

# TMDB API
TMDB_API_KEY=sua-chave-tmdb-aqui
TMDB_BASE_URL=https://api.themoviedb.org/3

# Mailtrap (Development)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=seu-usuario-mailtrap-aqui
MAILTRAP_PASS=sua-senha-mailtrap-aqui
MAILTRAP_FROM=noreply@cinemagico.com

# Frontend
FRONTEND_URL=http://localhost:8201
```

> O Docker Compose usa apenas as variáveis definidas no `.env`; nenhum valor fixo fica no arquivo de configuração.

## Fluxo de Recuperação de Senha

1. **Usuário solicita reset** → `POST /api/auth/forgot-password`
2. **Backend valida email** → Chama Auth Service
3. **Auth Service gera token único** → Salva em `reset_tokens` com expiração de 30 minutos
4. **Email enviado** → Via Mailtrap com link contendo o token
5. **Usuário clica no link** → Frontend valida o token com `GET /api/auth/reset/:token`
6. **Usuário redefine senha** → `POST /api/auth/reset-password` com novo password
7. **Token marcado como usado** → Evita reutilização

**Validações:**
- ✅ Token expirado? Erro 401
- ✅ Token já usado? Erro 401
- ✅ Tentativa com token inválido? Erro 404

## Observações

- O frontend expõe a aplicação na porta `8201`
- O backend catálogo permanece em `3000` (público, única entrada no host)
- O auth-service roda na porta `3001` (interna à rede Docker, sem publicação)
- A aplicação foi validada com criação real de usuário, consulta real de filmes da TMDB e email de recuperação
- O banco de dados é compartilhado entre backend e auth-service
- Mudanças na lógica de autenticação não afetam o deploy do catálogo e vice-versa

## Demonstração da Regra de Admin

Para demonstrar o RBAC pedido na atividade, use dois logins diferentes: um com `role = usuario` e outro com `role = admin`.

### Preparação

1. Cadastre dois usuários normalmente.
2. Promova um deles manualmente no banco:

```sql
UPDATE usuarios SET role = 'admin' WHERE email = 'admin@exemplo.com';
```

3. Faça login com o usuário comum e crie um comentário.
4. Use o `id` desse comentário para repetir a mesma ação com os dois logins.

### Resultado esperado

**Usuário comum tentando apagar comentário de outro usuário:**

```http
DELETE /api/comments/:id
Authorization: Bearer <token-do-usuario-comum>

HTTP/1.1 403 Forbidden
{
       "error": "Permissão insuficiente"
}
```

**Admin tentando apagar comentário de outro usuário:**

```http
DELETE /api/comments/:id
Authorization: Bearer <token-do-admin>

HTTP/1.1 200 OK
{
       "success": true
}
```

Esses dois casos são os prints sugeridos para a entrega.

## Estrutura de Pastas

```
.
├── backend/                       # Backend Catálogo
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── services/authServiceClient.js ✨ NOVO
│   ├── Dockerfile
│   └── package.json
│
├── auth-service/                  # ✨ NOVO - Microsserviço de Autenticação
│   ├── src/
│   │   ├── config/database.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── services/emailService.js
│   │   └── models/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── frontend/                      # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx (atualizado com link "Esqueci a senha")
│   │   │   ├── ForgotPassword.jsx ✨ NOVO
│   │   │   └── ResetPassword.jsx ✨ NOVO
│   │   └── App.jsx (atualizado com rota /reset)
│   ├── Dockerfile
│   └── package.json
│
├── migrations/                    # ✨ NOVO - Scripts de Migration
│   └── 001-add-auth-service.sql
│
├── docker-compose.yml            # Atualizado com auth-service
├── .env                          # Configurações (usar .env.example como referência)
└── README.md
```

## Próximas Melhorias

- [ ] Adicionar confirmação de email para novos usuários
- [ ] Implementar rate limiting no auth-service
- [ ] Adicionar logs de auditoria de autenticação
- [ ] Migrar Mailtrap → Brevo para produção
- [ ] Implement refresh tokens para melhor segurança

## Troubleshooting

### Auth Service não conecta ao banco
```bash
# Verifique se o DB_HOST está correto (deve ser "mariadb" na rede Docker)
docker logs cine-magico-auth-service
```

### Email não chega
```bash
# Verifique credenciais do Mailtrap
# Acesse https://mailtrap.io/inbox para ver emails capturados
# Confirme que MAILTRAP_USER e MAILTRAP_PASS estão corretos no .env
```

### Link de reset expira rápido
```bash
# O link tem expiração de 30 minutos
# Você pode testar com SQL direto:
# UPDATE reset_tokens SET expira_em = NOW() - INTERVAL 1 MINUTE WHERE token = 'xxx';
```

## Testes Validados ✅

- [x] Cadastro de usuário funciona
- [x] Login com email e senha funciona
- [x] Solicitação de recuperação de senha envia email
- [x] Email chega corretamente no Mailtrap
- [x] Link de reset funciona por até 30 minutos
- [x] Link expira após 30 minutos
- [x] Token não pode ser reutilizado
- [x] Usuários com roles diferentes têm dados separados
- [x] Backend e Auth Service se comunicam via rede Docker interna