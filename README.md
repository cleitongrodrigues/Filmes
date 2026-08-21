# Cine Mágico

Aplicação de catálogo de filmes com autenticação, favoritos, comentários e integração com a TMDB.

## Acesso em produção

https://cleiton-souza-isw055.lapps.studio/login

## Desenvolvido por

@siriani

## Repositório

Projeto público e organizado para execução local e em container.

## Funcionalidades

- Cadastro e login de usuários reais
- Catálogo de filmes com dados da TMDB
- Favoritar filmes por usuário
- Adicionar e visualizar comentários
- Persistência em banco MySQL/MariaDB
- Execução em Docker na porta `8201`

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MySQL/MariaDB
- Containerização: Docker + Docker Compose

## Rodar localmente

1. Clone o projeto
2. Crie um arquivo `.env` na raiz com as variáveis necessárias
3. Execute:

```bash
docker compose up --build
```

4. Acesse no navegador:

```text
http://localhost:8201
```

## Variáveis de ambiente

Arquivo `.env` na raiz do projeto:

```env
PORT=3000
JWT_SECRET=sua_chave_segura
DB_HOST=seu_host
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
DB_DIALECT=mysql
APP_PORT=8201
TMDB_API_KEY=sua_chave_tmdb
TMDB_BASE_URL=https://api.themoviedb.org/3
```

> O Docker Compose usa apenas as variáveis definidas no `.env`; nenhum valor fixo fica no arquivo de configuração.

## Observações

- O frontend expõe a aplicação na porta `8201`
- O backend permanece em `3000` dentro da rede Docker
- A aplicação foi validada com criação real de usuário e consulta real de filmes da TMDB