# Cine Mágico

Aplicação de catálogo de filmes com autenticação, favoritos e comentários.

## Acesso em produção

https://cleiton-souza-isw055.lapps.studio/login

## Funcionalidades

- Cadastro e login de usuários
- Catálogo de filmes
- Favoritar filmes
- Adicionar comentários
- Persistência em banco MySQL
- Execução em Docker

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MySQL
- Containerização: Docker + Docker Compose

## Rodar localmente

1. Clone o projeto
2. Acesse a pasta raiz
3. Configure as variáveis de ambiente no arquivo `.env`
4. Execute:

```bash
docker compose up --build
```

5. Acesse no navegador:

```text
http://localhost:8201
```

## Variáveis de ambiente

Exemplo:

```env
PORT=3000
JWT_SECRET=sua_chave_segura
DB_HOST=35.226.64.52
DB_PORT=3306
DB_USER=IAC_2026_02_cleiton_souza
DB_PASSWORD=sua_senha
DB_NAME=IAC_2026_02_cleiton_souza
DB_DIALECT=mysql
```

## Observações

- O frontend expõe a aplicação na porta `8201`
- O backend permanece em `3000` dentro da rede Docker
- A aplicação foi validada com criação real de usuário no banco MySQL